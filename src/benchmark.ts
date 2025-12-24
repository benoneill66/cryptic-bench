import type { Clue, ModelResult } from "./types";
import { createClient } from "./openrouterClient";
import { scoreAnswer, isPass } from "./scorer";
import fs from 'fs';
import path from 'path';

// Load models.json to get input/output costs per model (if present)
const MODELS_FILE = path.resolve(process.cwd(), 'models.json');
let MODEL_COSTS: Record<string, { inputCostPer1k?: number; outputCostPer1k?: number; inputCostPerM?: number; outputCostPerM?: number }> = {};
try {
  const raw = fs.readFileSync(MODELS_FILE, 'utf-8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    for (const p of parsed) {
      if (typeof p === 'string') continue;
      if (p && p.name) {
        MODEL_COSTS[p.name] = {
          inputCostPer1k: Number(p.inputCostPer1k ?? p.costPer1k ?? 0),
          outputCostPer1k: Number(p.outputCostPer1k ?? p.costPer1k ?? 0),
        };
      }
    }
  }
} catch (e) {
  // ignore
}

function costForModelTokens(model: string, promptTokens: number, completionTokens: number) {
  const md = MODEL_COSTS[model];
  // Support both new per-M fields (`inputCostPerM`) and older per-1k fields for
  // backwards compatibility. Normalize to per-M.
  const inputPerM = md?.inputCostPerM ?? (md?.inputCostPer1k ? md.inputCostPer1k * 1000 : 0);
  const outputPerM = md?.outputCostPerM ?? (md?.outputCostPer1k ? md.outputCostPer1k * 1000 : 0);
  // Rates are per million tokens; compute cost = rate/1_000_000 * tokens
  return (inputPerM / 1_000_000) * promptTokens + (outputPerM / 1_000_000) * completionTokens;
}

export type RunOptions = {
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  verbose?: boolean;
};

export async function runBenchmark(
  clues: Clue[],
  options: RunOptions
): Promise<ModelResult[]> {
  const client = createClient(options.apiKey);
  const results: ModelResult[] = [];

  for (let idx = 0; idx < clues.length; idx++) {
    const clue = clues[idx]!;
    const prompt = `You are an expert cryptic crossword solver.\n\nClue: ${clue.clue}\n\nRespond with a minimal JSON object exactly like this: {"answer":"<one-word-or-phrase>","reasoning":"<brief reasoning>"}. Return JSON only.`;
    const t0 = Date.now();
    console.log(
      `[${options.model}] Clue ${idx + 1}/${clues.length} (${clue.id}): ${
        clue.clue
      }`
    );

    try {
      const resp = await client.chat.send({
        model: options.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert cryptic crossword solver. Provide concise JSON only.",
          },
          { role: "user", content: prompt },
        ],
        maxTokens: options.maxTokens ?? 200,
        temperature: options.temperature ?? 0.0,
        stream: false,
      });

      // Normalize message content to a string (SDK may return string or structured content)
      const content = resp.choices?.[0]?.message?.content;
      let raw = "";
      if (typeof content === "string") {
        raw = content;
      } else if (Array.isArray(content)) {
        raw = content
          .map((it: any) =>
            typeof it === "string" ? it : it?.text ?? it?.content ?? ""
          )
          .join(" ");
      } else {
        raw = String(content ?? "");
      }

      let answerText = raw;

      try {
        // try parse JSON
        const parsed = JSON.parse(raw);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "answer" in parsed
        ) {
          answerText = String((parsed as any).answer);
        }
      } catch (e) {
        // fallback: try to extract answer using a regex that finds a quoted string or a bare word
        const m =
          (raw as string).match(/"answer"\s*:\s*"([^\"]+)"/i) ||
          (raw as string).match(/answer\s*[:=]\s*([A-Za-z0-9'\- ]+)/i);
        if (m && m[1]) answerText = m[1].trim();
      }

      const score = scoreAnswer(clue.answer, answerText);
      const pass = isPass(clue.answer, answerText);

      // Extract usage tokens if available, otherwise estimate from text length
      const usage = (resp as any).usage ?? (resp as any).meta?.usage ?? null;
      let promptTokens = 0;
      let completionTokens = 0;
      let tokens = 0;
      if (usage) {
        promptTokens = usage.prompt_tokens ?? Math.floor((usage.total_tokens ?? 0) / 2);
        completionTokens = usage.completion_tokens ?? Math.ceil((usage.total_tokens ?? 0) / 2);
        tokens = (usage.total_tokens ?? (promptTokens + completionTokens));
      } else {
        tokens = Math.max(1, Math.ceil(String(raw).length / 4));
        // split estimate 50/50
        promptTokens = Math.floor(tokens / 2);
        completionTokens = tokens - promptTokens;
      }
      const estCost = costForModelTokens(options.model, promptTokens, completionTokens);

      const t1 = Date.now();
      const took = t1 - t0;
      console.log(`→ Answer: ${answerText} — ${pass ? 'PASS' : 'FAIL'} (${took}ms, ${tokens} tokens, $${estCost.toFixed(6)})`);
      if (options.verbose) console.log(`RAW: ${String(raw).slice(0, 2000)}`);

      results.push({
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
      });
    } catch (err: any) {
      const t1 = Date.now();
      const took = t1 - t0;
      console.log(`→ Error: ${String(err?.message ?? err)} (${took}ms)`);
      results.push({
        model: options.model,
        clueId: clue.id,
        answer: "",
        raw: String(err?.message ?? err),
        score: 0,
        pass: false,
        tokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        cost: 0,
      });
    }
  }

  return results;
}
