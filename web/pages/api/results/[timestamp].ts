import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { timestamp } = req.query;

  if (!timestamp || typeof timestamp !== "string") {
    res.status(400).json({ error: "Timestamp parameter is required" });
    return;
  }

  try {
    const cwd = process.cwd();
    const parent = path.resolve(cwd, "..");
    const candidates = [
      // cwd data folder (web/data)
      path.join(cwd, "data", `results-${timestamp}.json`),
      // web data folder (repo root)
      path.join(parent, "web", "data", `results-${timestamp}.json`),
      // repo root
      path.join(parent, `results-${timestamp}.json`),
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
        error: "Results file not found for timestamp",
        timestamp,
        tried: candidates,
      });
      return;
    }

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      res.status(200).json({
        timestamp,
        filePath,
        ...parsed,
      });
    } catch (parseErr) {
      res.status(500).json({
        error: "Failed to parse results file",
        file: filePath,
        detail: String(parseErr),
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Failed to read results file",
      detail: String(err),
    });
  }
}
