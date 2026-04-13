const VLLM_BASE_URL = process.env.VLLM_BASE_URL ?? "http://localhost:8000";

export async function getTutorRuntimeStatus() {
  type HealthResponse = {
    status: string;
    model_loaded: boolean;
    current_model: string | null;
    device: string;
  };
  type ModelsResponse = {
    models: string[];
    model_details: { id: string; label: string }[];
    current_model: string | null;
    current_model_label: string | null;
  };

  // Use /health for the liveness check — it's lightweight and always fast
  const [health, models] = await Promise.all([
    fetch(`${VLLM_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.json() as Promise<HealthResponse>)
      .catch(() => null),

    fetch(`${VLLM_BASE_URL}/models`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.json() as Promise<ModelsResponse>)
      .catch(() => null),
  ]);

  // vllmReady = server is up (health responded), regardless of whether a model is loaded yet
  const vllmReady = health !== null && health.status === "ok";

  return {
    grpcReady: vllmReady,
    vllmReady,
    modelLoaded: health?.model_loaded ?? false,
    availableModels: models?.models ?? [],
    modelDetails: models?.model_details ?? [],
    model: models?.current_model_label ?? models?.current_model ?? null,
    currentModelId: models?.current_model ?? null,
  };
}

