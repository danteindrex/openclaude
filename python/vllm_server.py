"""
vllm_server.py
--------------
FastAPI backend for running local HuggingFace Transformers models natively
on Windows — no vLLM, no WSL2 needed.

On startup the first model found under ../models/ is auto-loaded.
The Phi-3 model stored in models/gemma/ will be used automatically.

Endpoints:
  GET  /models          → list downloaded models + currently loaded model
  POST /switch_model    → load a different model by folder name
  POST /generate        → generate text (streaming SSE or blocking JSON)
  POST /rag/ingest      → ingest text into ChromaDB for RAG
"""

import asyncio
import os
import threading
from pathlib import Path
from typing import AsyncGenerator, Optional

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
import uvicorn

# ── Paths ─────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent.resolve()
MODELS_DIR = SCRIPT_DIR.parent / "models"

# ── Optional RAG ──────────────────────────────────────────────────────────────

try:
    from rag_service import rag_service
    RAG_AVAILABLE = True
except ImportError as e:
    rag_service = None
    RAG_AVAILABLE = False
    print(f"WARNING: RAG disabled — {e}")

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="Local Transformers Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Engine State ──────────────────────────────────────────────────────────────

class EngineState:
    model: Optional[object] = None
    tokenizer: Optional[object] = None
    current_model: Optional[str] = None
    _lock = threading.Lock()

    @classmethod
    def device(cls) -> str:
        return "cuda" if torch.cuda.is_available() else "cpu"

    @classmethod
    def load_model(cls, model_path: str) -> None:
        """Load a HuggingFace Transformers model from a local directory."""
        path = Path(model_path)
        if not path.exists():
            raise ValueError(f"Model path does not exist: {model_path}")

        dev = cls.device()
        dtype = torch.float16 if dev == "cuda" else torch.float32

        print(f"\n{'='*60}")
        print(f"Loading model: {path.name}")
        print(f"Device      : {dev} | Dtype: {dtype}")
        print(f"Path        : {path}")
        print(f"{'='*60}\n")

        with cls._lock:
            # Free previous model from memory
            if cls.model is not None:
                del cls.model
                cls.model = None
                if dev == "cuda":
                    torch.cuda.empty_cache()

            cls.tokenizer = AutoTokenizer.from_pretrained(
                str(path),
                trust_remote_code=True,
            )

            if dev == "cuda":
                cls.model = AutoModelForCausalLM.from_pretrained(
                    str(path),
                    torch_dtype=dtype,
                    device_map="auto",
                    trust_remote_code=True,
                    low_cpu_mem_usage=True,
                    attn_implementation="eager",
                )
            else:
                # CPU path — no accelerate needed
                cls.model = AutoModelForCausalLM.from_pretrained(
                    str(path),
                    torch_dtype=dtype,
                    trust_remote_code=True,
                    attn_implementation="eager",
                )
                cls.model = cls.model.to("cpu")

            cls.model.eval()
            cls.current_model = path.name

        print(f"\n✅  Model '{cls.current_model}' ready on {dev}.\n")


    @classmethod
    def is_loaded(cls) -> bool:
        return cls.model is not None and cls.tokenizer is not None


# ── Auto-load first available model on startup ─────────────────────────────────

@app.on_event("startup")
async def auto_load_default_model() -> None:
    if not MODELS_DIR.exists():
        print(f"WARNING: models directory not found at {MODELS_DIR}")
        return

    subdirs = sorted([d for d in MODELS_DIR.iterdir() if d.is_dir()])
    if not subdirs:
        print("WARNING: No model folders found in models/")
        return

    first = subdirs[0]
    print(f"Auto-loading first model found: {first.name}")
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, EngineState.load_model, str(first))
    except Exception as e:
        print(f"ERROR: Auto-load failed for '{first.name}': {e}")


# ── Request schemas ────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    messages: Optional[list[dict]] = None
    max_tokens: int = 512
    temperature: float = 0.7
    use_rag: bool = False
    stream: bool = True


class SwitchModelRequest(BaseModel):
    model_name: str


class IngestRequest(BaseModel):
    text: str
    source: str = "manual"


# ── Streaming helper ──────────────────────────────────────────────────────────

async def stream_tokens(
    prompt: str,
    max_tokens: int,
    temperature: float,
) -> AsyncGenerator[str, None]:
    """Generate tokens in a background thread and yield them async."""
    if not EngineState.is_loaded():
        yield "Error: no model is loaded."
        return

    streamer = TextIteratorStreamer(
        EngineState.tokenizer,       # type: ignore[arg-type]
        skip_prompt=True,
        skip_special_tokens=True,
        timeout=120.0,
    )

    inputs = EngineState.tokenizer(           # type: ignore[operator]
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=2048,
    )
    input_ids = inputs["input_ids"]
    if EngineState.device() == "cuda":
        input_ids = input_ids.cuda()

    gen_kwargs = dict(
        input_ids=input_ids,
        max_new_tokens=max_tokens,
        temperature=max(temperature, 1e-6),
        do_sample=temperature > 0.05,
        streamer=streamer,
        pad_token_id=(
            EngineState.tokenizer.eos_token_id      # type: ignore[union-attr]
            if EngineState.tokenizer.pad_token_id is None  # type: ignore[union-attr]
            else EngineState.tokenizer.pad_token_id        # type: ignore[union-attr]
        ),
    )

    thread = threading.Thread(
        target=EngineState.model.generate,   # type: ignore[union-attr]
        kwargs=gen_kwargs,
        daemon=True,
    )
    thread.start()

    for token_text in streamer:
        if token_text:
            yield token_text
        await asyncio.sleep(0)

    thread.join()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/models")
async def list_models():
    """List downloaded model folders and the currently loaded model.
    
    Each entry has:
      'id'    - folder name (used for /switch_model)
      'label' - friendly name from model_id.txt (or folder name as fallback)
    """
    models: list[dict] = []
    if MODELS_DIR.exists():
        for d in sorted(MODELS_DIR.iterdir()):
            if not d.is_dir():
                continue
            model_id_file = d / "model_id.txt"
            label = model_id_file.read_text().strip() if model_id_file.exists() else d.name
            models.append({"id": d.name, "label": label})

    # Also return a flat list of labels for simple consumers (like the status check)
    return {
        "models": [m["label"] for m in models],
        "model_details": models,
        "current_model": EngineState.current_model,
        "current_model_label": next(
            (m["label"] for m in models if m["id"] == EngineState.current_model), 
            EngineState.current_model,
        ),
    }


@app.post("/switch_model")
async def switch_model(req: SwitchModelRequest):
    """Hot-swap to a different local model by folder name."""
    model_path = MODELS_DIR / req.model_name
    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Model folder '{req.model_name}' not found in {MODELS_DIR}",
        )
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, EngineState.load_model, str(model_path))
        return {"status": "success", "model": req.model_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate(req: GenerateRequest):
    """Generate a response. Supports streaming (SSE) and blocking modes."""
    if not EngineState.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="No model is loaded. The server is still starting up, or auto-load failed.",
        )

    # Build the prompt string
    if req.messages:
        # Use the model's native chat template for correct formatting
        try:
            prompt = EngineState.tokenizer.apply_chat_template(  # type: ignore[union-attr]
                req.messages,
                tokenize=False,
                add_generation_prompt=True,
            )
        except Exception as e:
            # Fallback: simple text format if template fails
            print(f"WARNING: apply_chat_template failed ({e}), using fallback format")
            prompt = "\n".join(
                f"{m.get('role', 'user').capitalize()}: {m.get('content', '')}" 
                for m in req.messages
            ) + "\nAssistant:"
    elif req.prompt:
        prompt = req.prompt
    else:
        raise HTTPException(status_code=400, detail="Either 'prompt' or 'messages' is required.")

    if req.use_rag and RAG_AVAILABLE and rag_service:
        context = rag_service.get_context(prompt)
        prompt = f"Context:\n{context}\n\n{prompt}"
        print(f"RAG context injected ({len(context)} chars)")

    if req.stream:
        async def event_stream():
            async for token in stream_tokens(prompt, req.max_tokens, req.temperature):
                yield token
        return StreamingResponse(event_stream(), media_type="text/event-stream")

    # Non-streaming — collect all tokens first
    full_text = ""
    async for token in stream_tokens(prompt, req.max_tokens, req.temperature):
        full_text += token
    return {"text": full_text}


@app.post("/rag/ingest")
async def ingest_document(req: IngestRequest):
    """Ingest a text document into the ChromaDB vector store."""
    if not RAG_AVAILABLE or not rag_service:
        raise HTTPException(status_code=503, detail="RAG is not available.")
    chunks = rag_service.ingest_text(req.text, req.source)
    return {"status": "success", "chunks_added": chunks}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": EngineState.is_loaded(),
        "current_model": EngineState.current_model,
        "device": EngineState.device(),
    }


if __name__ == "__main__":
    uvicorn.run("vllm_server:app", host="0.0.0.0", port=8000, reload=False)
