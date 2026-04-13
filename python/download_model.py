import argparse
import os
from huggingface_hub import snapshot_download

def download_model(model_id: str, dest_dir: str):
    print(f"Downloading model {model_id} to {dest_dir}...")
    try:
        snapshot_download(
            repo_id=model_id,
            local_dir=dest_dir,
            local_dir_use_symlinks=False,
            # We skip heavy pytorch/safetensors files if we want a specific framework,
            # but for vLLM safetensors are preferred. We download standard files.
            ignore_patterns=["*.pt", "*.pth", "*.bin"]
        )
        print("Download completed successfully!")
    except Exception as e:
        print(f"Error downloading model: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download a model from Hugging Face Hub")
    # Using 'google/gemma-2-2b-it' as default, but allows whatever "gemma 3n" means in user context
    parser.add_argument("--model", type=str, default="google/gemma-2-2b-it", help="HuggingFace Model ID")
    parser.add_argument("--dest", type=str, default="./models/gemma", help="Destination folder")
    
    args = parser.parse_args()
    
    # We store model info so our backend can 'discover' downloaded models easily
    os.makedirs(args.dest, exist_ok=True)
    
    # Mark the repository name in a tiny txt file so vllm knows the origin model ID if needed
    with open(os.path.join(args.dest, "model_id.txt"), "w") as f:
        f.write(args.model)
        
    download_model(args.model, args.dest)
