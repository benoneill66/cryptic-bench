import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Try multiple candidate locations for results files. When running the web
  // app in `web/` during development, the repo root is the parent directory.
  const cwd = process.cwd();
  const parent = path.resolve(cwd, "..");
  const candidates = [
    // repo root
    path.join(parent, "results_test.json"),
    path.join(parent, "results.json"),
    // web data folder (repo root)
    path.join(parent, "web", "data", "results_test.json"),
    path.join(parent, "web", "data", "results.json"),
    // cwd (web/)
    path.join(cwd, "results_test.json"),
    path.join(cwd, "results.json"),
    // cwd data folder (web/data)
    path.join(cwd, "data", "results_test.json"),
    path.join(cwd, "data", "results.json"),
  ];

  let filePath: string | null = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    res.status(404).json({
      error: "No results file found",
      tried: candidates,
    });
    return;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({
      error: "Failed to read/parse results file",
      file: filePath,
      detail: String(err),
    });
  }
}
