#!/usr/bin/env bun
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { runBenchmark } from "./benchmark";
import { MODEL_NAMES } from "./models";
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
    // Default: use the TypeScript models export. If a specific models file is
    // provided via --models-file we still load it for backward compatibility.
    if (modelsFileArg) {
      let modelsFile = path.resolve(process.cwd(), "models.json");
      const m = modelsFileArg.split(/=(.+)/)[1];
      if (m && m.trim()) modelsFile = m;
      try {
        const raw = fs.readFileSync(modelsFile, "utf-8");
        modelList = JSON.parse(raw) as string[];
        console.log("Loaded models from", modelsFile);
      } catch (err) {
        modelList = MODEL_NAMES.slice();
        console.log(
          "Failed to load provided models file; falling back to TypeScript models export"
        );
      }
    } else {
      modelList = MODEL_NAMES.slice();
      console.log("Loaded models from TypeScript export (src/models.ts)");
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

  // Load existing results to merge with new results
  const allResults: Record<string, any> = {};
  try {
    const webDataDir = path.resolve(process.cwd(), "web", "data");
    const webPublicDataDir = path.resolve(
      process.cwd(),
      "web",
      "public",
      "data"
    );
    const webResultsPath = path.join(webDataDir, "results.json");
    const webPublicResultsPath = path.join(webPublicDataDir, "results.json");

    let loadedFrom = "";

    // Try web/data first, then fall back to web/public/data
    if (fs.existsSync(webResultsPath)) {
      const existingResults = JSON.parse(
        fs.readFileSync(webResultsPath, "utf-8")
      );
      Object.assign(allResults, existingResults);
      loadedFrom = webDataDir;
    } else if (fs.existsSync(webPublicResultsPath)) {
      const existingResults = JSON.parse(
        fs.readFileSync(webPublicResultsPath, "utf-8")
      );
      Object.assign(allResults, existingResults);
      loadedFrom = webPublicDataDir;
    }

    if (loadedFrom) {
      console.log(
        `Loaded ${
          Object.keys(allResults).length
        } existing model results from ${loadedFrom}`
      );
    } else {
      console.log("No existing results found, starting fresh");
    }
  } catch (err) {
    console.log("Error loading existing results:", String(err));
  }

  const modelsToRun = new Set(modelList);

  // Worker pool for models so we can run several models concurrently without exhausting resources
  let nextModelIdx = 0;
  async function modelWorker() {
    while (true) {
      const idx = nextModelIdx++;
      if (idx >= modelList.length) return;
      const model = modelList[idx]!;
      console.log(`\n▶ Running model ${model} ...`);
      const res = await runBenchmark(clues, {
        model,
        apiKey,
        temperature: 0.0,
      });
      const total = res.length;
      const passCount = res.filter((r) => r.pass).length;
      const passRate = passCount / total;
      allResults[model] = { total, passCount, passRate, results: res };

      console.log(
        `Model ${model}: ${passCount}/${total} passed, pass rate ${prettyPercent(
          passRate
        )}`
      );
      console.log(`→ Updated results for model ${model}`);
    }
  }

  const modelWorkers = new Array(modelList.length)
    .fill(0)
    .map(() => modelWorker());
  await Promise.all(modelWorkers);

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

  // Also save a copy into the web visualizer's data directory so the UI can
  // load results locally when running the dev server. We save both a
  // timestamped file and a stable `results.json` (and `results_test.json` in
  // test mode).
  try {
    const webDataDir = path.resolve(process.cwd(), "web", "data");
    const webPublicDataDir = path.resolve(
      process.cwd(),
      "web",
      "public",
      "data"
    );
    const webResultsPath = path.join(webDataDir, "results.json");
    const webPublicResultsPath = path.join(webPublicDataDir, "results.json");

    ensureDirForFile(webResultsPath);
    ensureDirForFile(webPublicResultsPath);

    saveJSON(webResultsPath, allResults);
    saveJSON(webPublicResultsPath, allResults);

    if (isTest) {
      const webTestPath = path.join(webDataDir, "results_test.json");
      const webPublicTestPath = path.join(
        webPublicDataDir,
        "results_test.json"
      );
      saveJSON(webTestPath, allResults);
      saveJSON(webPublicTestPath, allResults);
    }

    // timestamped copy
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const webTsPath = path.join(webDataDir, `results-${ts}.json`);
    const webPublicTsPath = path.join(webPublicDataDir, `results-${ts}.json`);
    saveJSON(webTsPath, allResults);
    saveJSON(webPublicTsPath, allResults);

    console.log(`Also saved copies to ${webDataDir} and ${webPublicDataDir}`);
  } catch (err) {
    console.error("Failed to save web copy of results:", err);
  }

  // Summary of merge operation
  const totalModels = Object.keys(allResults).length;
  const preservedModels = Object.keys(allResults).filter(
    (m) => !modelsToRun.has(m)
  );
  const updatedModels = Object.keys(allResults).filter((m) =>
    modelsToRun.has(m)
  );

  console.log("\n=== Results Merge Summary ===");
  console.log(`Total models in results: ${totalModels}`);
  console.log(`Models updated in this run: ${updatedModels.length}`);
  if (preservedModels.length > 0) {
    console.log(
      `Models preserved from previous runs: ${preservedModels.length}`
    );
    console.log(`Preserved: ${preservedModels.join(", ")}`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
