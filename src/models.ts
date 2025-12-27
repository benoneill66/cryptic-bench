export type ModelDef = {
  name: string;
  inputCostPerM?: number;
  outputCostPerM?: number;
};

export const MODELS: ModelDef[] = [
  // --- Anthropic Models ---
  // {
  //   name: "anthropic/claude-sonnet-4.5",
  //   inputCostPerM: 3.0,
  //   outputCostPerM: 15.0,
  // },
  // {
  //   name: "anthropic/claude-opus-4.5",
  //   inputCostPerM: 5.0,
  //   outputCostPerM: 25.0,
  // },
  // --- Google Models ---
  // {
  //   name: "google/gemini-3-flash-preview",
  //   inputCostPerM: 0.5,
  //   outputCostPerM: 3.0,
  // },
  // {
  //   name: "google/gemini-3-pro-preview",
  //   inputCostPerM: 2,
  //   outputCostPerM: 12,
  // },
  // --- OpenAI Models ---
  { name: "openai/gpt-4o-mini", inputCostPerM: 0.15, outputCostPerM: 0.6 },
  // { name: "openai/gpt-5", inputCostPerM: 1.25, outputCostPerM: 10.0 },
  // { name: "openai/gpt-5.1", inputCostPerM: 1.5, outputCostPerM: 10.0 },
  // { name: "openai/gpt-5.2", inputCostPerM: 1.75, outputCostPerM: 14.0 },
  //
  // --- Disabled Models (for reference) ---
  // { name: "openai/gpt-4o", inputCostPerM: 2.5, outputCostPerM: 10.0 },
  // { name: "anthropic/claude-3.5-sonnet", inputCostPerM: 3.0, outputCostPerM: 15.0 },
  // { name: "meta/llama-3.1-405b-instruct", inputCostPerM: 3.5, outputCostPerM: 3.5 },
  // { name: "google/gemini-2.5-flash", inputCostPerM: 0.15, outputCostPerM: 0.6 },
  // { name: "deepseek/deepseek-v3", inputCostPerM: 0.27, outputCostPerM: 1.1 },
  // --- MiniMax Models ---
  // {
  //   name: "minimax/minimax-m2.1",
  //   inputCostPerM: 0.3,
  //   outputCostPerM: 1.2,
  // },
  // --- Z-AI Models ---
  // {
  //   name: "z-ai/glm-4.7",
  //   inputCostPerM: 0.6,
  //   outputCostPerM: 2.2,
  // },
  // // --- X-AI Models ---
  // {
  //   name: "x-ai/grok-4.1-fast",
  //   inputCostPerM: 0.2,
  //   outputCostPerM: 0.5,
  // },
];

export const MODEL_NAMES = MODELS.map((m) => m.name);

export default MODELS;
