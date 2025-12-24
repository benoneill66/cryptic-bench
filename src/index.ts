#!/usr/bin/env bun
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { runBenchmark } from "./benchmark";
import type { Clue } from "./types";
import { prettyPercent } from "./scorer";
import { saveJSON, saveCSV, ensureDirForFile } from "./exporter";

async function main() {
  const args = process.argv.slice(2);
  const modelsArg = args.find((a) => a.startsWith("--models="));
  const modelsFileArg = args.find((a) => a.startsWith("--models-file="));
  const modeArg = args.find((a) => a.startsWith("--mode=")) || null;
  const isTest = args.includes("--test") || modeArg === "--mode=test";
  const apiKeyArg = args.find((a) => a.startsWith("--api-key="));
  const outArg = args.find(
    (a) => a.startsWith("--out=") || a.startsWith("--output=")
  );
  const outPath = outArg ? outArg.split(/=(.+)/)[1] : null;
  let modelList: string[];
  if (isTest) {
    // Test mode runs a single small/fast model
    modelList = ["openai/gpt-4o-mini"];
    console.log("Running in TEST mode — only running", modelList.join(","));
  } else if (modelsArg) {
    modelList = modelsArg.replace("--models=", "").split(",");
  } else {
    // Try to load models.json (or provided file) as the default list
    let modelsFile = path.resolve(process.cwd(), "models.json");
    if (modelsFileArg) {
      const m = modelsFileArg.split(/=(.+)/)[1];
      if (m && m.trim()) modelsFile = m;
    }
    try {
      const raw = fs.readFileSync(modelsFile, "utf-8");
      modelList = JSON.parse(raw) as string[];
      console.log("Loaded models from", modelsFile);
    } catch (err) {
      modelList = ["openai/gpt-4o"];
      console.log("No models file found; defaulting to", modelList.join(","));
    }
  }
  const apiKey = apiKeyArg ? apiKeyArg.replace("--api-key=", "") : undefined;

  const cluesPath = path.resolve(process.cwd(), "clues", "clues.json");
  if (!fs.existsSync(cluesPath)) {
    console.error("No clues found at", cluesPath);
    process.exit(1);
  }
  const clues = JSON.parse(fs.readFileSync(cluesPath, "utf-8")) as Clue[];

  console.log("Running cryptic benchmark");
  console.log("Models:", modelList.join(", "));
  console.log("Clues:", clues.length);

  const allResults: Record<string, any> = {};

  for (const model of modelList) {
    console.log(`\n▶ Running model ${model} ...`);
    const res = await runBenchmark(clues, { model, apiKey, temperature: 0.0 });
    const total = res.length;
    const passCount = res.filter((r) => r.pass).length;
    const passRate = passCount / total;
    allResults[model] = { total, passCount, passRate, results: res };

    console.log(
      `Model ${model}: ${passCount}/${total} passed, pass rate ${prettyPercent(
        passRate
      )}`
    );
  }

  // Ranking
  const ranking = Object.entries(allResults)
    .map(([model, v]) => ({
      model,
      passRate: v.passRate,
      passCount: v.passCount,
      total: v.total,
    }))
    .sort((a, b) => b.passRate - a.passRate);

  console.log("\n=== Ranking ===");
  ranking.forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.model} — pass ${prettyPercent(r.passRate)} (${
        r.passCount
      }/${r.total})`
    );
  });

  console.log(
    "\nDetailed results are available in memory if you want to extend the tool to save CSV/JSON outputs."
  );

  if (outPath) {
    try {
      ensureDirForFile(outPath);
      const ext = String(outPath).split(".").pop()?.toLowerCase() ?? "json";
      if (ext === "csv") {
        saveCSV(outPath, allResults, clues);
      } else {
        saveJSON(outPath, allResults);
      }
      console.log(`Saved results to ${outPath}`);
    } catch (err) {
      console.error("Failed to save results:", err);
    }
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
