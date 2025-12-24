import fs from "fs";
import path from "path";
import type { Clue } from "./types";

export function saveJSON(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function escapeCsv(value: string) {
  if (value == null) return "";
  const v = String(value).replace(/"/g, '""');
  if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v}"`;
  return v;
}

export function saveCSV(
  filePath: string,
  allResults: Record<string, any>,
  clues: Clue[]
) {
  const cluesById: Record<string, Clue> = {};
  for (const c of clues) cluesById[c.id] = c;

  const rows: string[] = [];
  const header = [
    "model",
    "clueId",
    "clue",
    "expected",
    "answer",
    "pass",
    "score",
    "raw",
  ];
  // include tokens and cost in CSV
  header.push("tokens", "cost");
  // include prompt/completion tokens
  header.push("promptTokens", "completionTokens");
  rows.push(header.join(","));

  for (const [model, v] of Object.entries(allResults)) {
    const results: any[] = v.results ?? [];
    for (const r of results) {
      const clue = cluesById[r.clueId];
      const cols = [
        model,
        r.clueId,
        clue?.clue ?? "",
        clue?.answer ?? "",
        r.answer ?? "",
        r.pass ? "1" : "0",
        r.score != null ? String(r.score) : "",
        r.raw ? String(r.raw).replace(/\r?\n/g, " ") : "",
        r.tokens != null ? String(r.tokens) : "",
        r.cost != null ? String(r.cost) : "",
        r.promptTokens != null ? String(r.promptTokens) : "",
        r.completionTokens != null ? String(r.completionTokens) : "",
      ].map((c) => escapeCsv(String(c)));
      rows.push(cols.join(","));
    }
  }

  fs.writeFileSync(filePath, rows.join("\n"), "utf-8");
}

export function ensureDirForFile(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
