export type ModelDef = {
  name: string;
  inputCostPerM?: number;
  outputCostPerM?: number;
};

export const MODELS: ModelDef[] = [
  // --- Flagship / Frontier Models ---
  //   { name: "openai/gpt-4.5", inputCostPerM: 75.0, outputCostPerM: 150.0 }, // The new "premium" tier
  //   { name: "openai/gpt-5", inputCostPerM: 1.25, outputCostPerM: 10.0 }, // Current standard flagship
  //   {
  //     name: "anthropic/claude-opus-4.5",
  //     inputCostPerM: 15.0,
  //     outputCostPerM: 75.0,
  //   },
  { name: "google/gemini-2.5-pro", inputCostPerM: 1.25, outputCostPerM: 10.0 },

  // --- High Performance / Mid-Tier ---
  { name: "openai/gpt-4o", inputCostPerM: 2.5, outputCostPerM: 10.0 },
  //   {
  //     name: "anthropic/claude-3.5-sonnet",
  //     inputCostPerM: 3.0,
  //     outputCostPerM: 15.0,
  //   },
  //   {
  //     name: "meta/llama-3.1-405b-instruct",
  //     inputCostPerM: 3.5,
  //     outputCostPerM: 3.5,
  //   },

  //   // --- Efficiency / Flash Models ---
  //   { name: "openai/gpt-4o-mini", inputCostPerM: 0.15, outputCostPerM: 0.6 },
  //   { name: "google/gemini-2.5-flash", inputCostPerM: 0.15, outputCostPerM: 0.6 },
  //   { name: "deepseek/deepseek-v3", inputCostPerM: 0.27, outputCostPerM: 1.1 },

  //   // --- Previews / Specialized ---
  //   {
  //     name: "google/gemini-3-flash-preview",
  //     inputCostPerM: 0.5,
  //     outputCostPerM: 3.0,
  //   },
];

export const MODEL_NAMES = MODELS.map((m) => m.name);

export default MODELS;
