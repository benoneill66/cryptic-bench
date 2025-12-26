import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface HistoryEntry {
  timestamp: string;
  filename: string;
  filePath: string;
  size: number;
  modifiedTime: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const cwd = process.cwd();
    const parent = path.resolve(cwd, "..");
    const candidates = [
      // cwd data folder (web/data)
      path.join(cwd, "data"),
      // web data folder (repo root)
      path.join(parent, "web", "data"),
    ];

    let dataDir: string | null = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        dataDir = p;
        break;
      }
    }

    if (!dataDir) {
      res.status(404).json({
        error: "Data directory not found",
        tried: candidates,
      });
      return;
    }

    const files = fs.readdirSync(dataDir);
    const resultFiles = files
      .filter((file) => file.startsWith("results-") && file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(dataDir!, file);
        const stats = fs.statSync(filePath);
        const timestamp = file.replace("results-", "").replace(".json", "");

        return {
          timestamp,
          filename: file,
          filePath,
          size: stats.size,
          modifiedTime: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Most recent first

    res.status(200).json({
      dataDir,
      files: resultFiles,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to read data directory",
      detail: String(err),
    });
  }
}
