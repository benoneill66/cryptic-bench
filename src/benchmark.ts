import type { Clue, ModelResult } from "./types";
import { createClient } from "./openrouterClient";
import { scoreAnswer, isPass } from "./scorer";

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

      const t1 = Date.now();
      const took = t1 - t0;
      console.log(
        `→ Answer: ${answerText} — ${pass ? "PASS" : "FAIL"} (${took}ms)`
      );
      if (options.verbose) console.log(`RAW: ${String(raw).slice(0, 2000)}`);

      results.push({
        model: options.model,
        clueId: clue.id,
        answer: answerText,
        raw,
        score,
        pass,
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
      });
    }
  }

  return results;
}
