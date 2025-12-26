import { OpenRouter } from "@openrouter/sdk";

export function createClient(apiKey?: string) {
  const key = apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!key)
    throw new Error("OPENROUTER_API_KEY must be set in the environment");

  const client = new OpenRouter({
    apiKey: key,
  });

  return client;
}
