import type { Clue, ModelResult } from "./types";
import { createClient } from "./openrouterClient";
import { scoreAnswer, isPass } from "./scorer";
import fs from "fs";
import path from "path";
import { MODELS as MODEL_DEFINITIONS } from "./models";
import { z } from "zod";

// Load model cost definitions from the TypeScript module (fallbacks available)
let MODEL_COSTS: Record<
  string,
  {
    inputCostPerM?: number;
    outputCostPerM?: number;
  }
> = {};
for (const m of MODEL_DEFINITIONS ?? []) {
  if (!m || !m.name) continue;
  MODEL_COSTS[m.name] = {
    inputCostPerM: Number(m.inputCostPerM ?? 0),
    outputCostPerM: Number(m.outputCostPerM ?? 0),
  };
}

function costForModelTokens(
  model: string,
  promptTokens: number,
  completionTokens: number
) {
  const md = MODEL_COSTS[model];
  // Support both new per-M fields (`inputCostPerM`) and older per-1k fields for
  // backwards compatibility. Normalize to per-M.
  const inputPerM = md?.inputCostPerM ?? 0;
  const outputPerM = md?.outputCostPerM ?? 0;
  // Rates are per million tokens; compute cost = rate/1_000_000 * tokens
  return (
    (inputPerM / 1_000_000) * promptTokens +
    (outputPerM / 1_000_000) * completionTokens
  );
}

export type RunOptions = {
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  verbose?: boolean;
  // How many clues to run in parallel for this model (default 4)
  concurrency?: number;
};

export async function runBenchmark(
  clues: Clue[],
  options: RunOptions
): Promise<ModelResult[]> {
  const client = createClient(options.apiKey);
  const results: ModelResult[] = new Array(clues.length);

  const schema = z.object({
    answer: z.string(),
    reasoning: z.string().optional(),
  });

  // Concurrency for clues (default 4)
  const concurrency = Math.max(1, options.concurrency ?? 4);

  // Worker pool pattern to process clue tasks with bounded concurrency
  let nextIdx = 0;
  async function worker() {
    while (true) {
      const idx = nextIdx++;
      if (idx >= clues.length) return;
      const clue = clues[idx]!;
      const prompt = `You are an expert cryptic crossword solver.\n\nClue: ${clue.clue}\n\nRespond with a minimal JSON object exactly like this: {"answer":"<one-word-or-phrase>","reasoning":"<brief reasoning>"}. Return JSON only.`;
      const t0 = Date.now();
      console.log(
        `[${options.model}] Clue ${idx + 1}/${clues.length} (${clue.id}): ${
          clue.clue
        }`
      );

      try {
        const response = await client.chat.send({
          model: options.model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert cryptic crossword solver. Provide a JSON response with 'answer' and optional 'reasoning' fields only.",
            },
            { role: "user", content: prompt },
          ],
          maxTokens: options.maxTokens ?? 200,
          temperature: options.temperature ?? 0.0,
        });

        const content = response.choices?.[0]?.message?.content;
        let raw = "";
        let object: any = {};

        if (typeof content === "string") {
          raw = content;
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(raw);
            if (
              typeof parsed === "object" &&
              parsed !== null &&
              "answer" in parsed
            ) {
              object = schema.parse(parsed);
            }
          } catch (e) {
            // If JSON parsing fails, create a basic object
            object = { answer: raw };
          }
        } else {
          raw = String(content ?? "");
          object = { answer: raw };
        }

        const answerText = String(object.answer ?? "");
        const usage = response.usage ?? null;

        const score = scoreAnswer(clue.answer, answerText);
        const pass = isPass(clue.answer, answerText);

        // Extract usage tokens from response
        const promptTokens = usage?.promptTokens ?? 0;
        const completionTokens = usage?.completionTokens ?? 0;
        const tokens = usage?.totalTokens ?? promptTokens + completionTokens;

        const estCost = costForModelTokens(
          options.model,
          promptTokens,
          completionTokens
        );

        const t1 = Date.now();
        const took = t1 - t0;
        console.log(
          `→ Answer: ${answerText} — ${
            pass ? "PASS" : "FAIL"
          } (${took}ms, ${tokens} tokens, $${estCost.toFixed(6)})`
        );

        if (options.verbose) {
          console.log(`RAW: ${String(raw).slice(0, 2000)}`);
        }

        results[idx] = {
          model: options.model,
          clueId: clue.id,
          answer: answerText,
          raw,
          score,
          pass,
          tokens,
          promptTokens,
          completionTokens,
          cost: estCost,
        };
      } catch (err: any) {
        const t1 = Date.now();
        const took = t1 - t0;
        const errMsg = String(err?.message ?? err);
        console.log(`→ Error: ${errMsg} (${took}ms)`);
        results[idx] = {
          model: options.model,
          clueId: clue.id,
          answer: "",
          raw: errMsg,
          score: 0,
          pass: false,
          tokens: 0,
          promptTokens: 0,
          completionTokens: 0,
          cost: 0,
        };
      }
    }
  }

  // start workers
  const workers = new Array(Math.min(concurrency, clues.length))
    .fill(0)
    .map(() => worker());
  await Promise.all(workers);

  return results;
}
