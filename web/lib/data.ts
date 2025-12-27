import {
  BenchmarkData,
  HistoricalResultFile,
  ModelSummary,
} from "@/types/benchmark";

export interface Clue {
  id: string;
  clue: string;
  answer: string;
  notes: string;
}

export async function fetchLatestResults(): Promise<BenchmarkData> {
  try {
    const response = await fetch("/data/results.json");
    if (!response.ok) {
      throw new Error("Failed to fetch latest results");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching latest results:", error);
    throw error;
  }
}

export async function fetchHistoricalResults(): Promise<
  HistoricalResultFile[]
> {
  try {
    // Hardcoded list of known historical files
    const knownFiles = [
      "results-2025-12-24T18-21-28-008Z.json",
      "results-2025-12-26T11-43-37-400Z.json",
      "results-2025-12-26T11-44-54-883Z.json",
      "results-2025-12-26T11-46-58-726Z.json",
      "results-2025-12-26T11-47-55-022Z.json",
      "results-2025-12-26T11-51-00-187Z.json",
      "results-2025-12-26T11-52-35-898Z.json",
      "results-2025-12-26T11-52-51-789Z.json",
      "results-2025-12-26T11-53-39-938Z.json",
      "results-2025-12-26T11-55-26-316Z.json",
      "results-2025-12-26T12-02-15-352Z.json",
      "results-2025-12-26T12-28-00-469Z.json",
      "results-2025-12-26T12-30-12-756Z.json",
    ];

    const results: HistoricalResultFile[] = [];

    for (const filename of knownFiles) {
      try {
        const response = await fetch(`/data/${filename}`);
        if (response.ok) {
          const data = await response.json();
          const timestamp = filename
            .replace("results-", "")
            .replace(".json", "");
          results.push({
            filename,
            timestamp,
            data,
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch ${filename}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return results;
  } catch (error) {
    console.error("Error fetching historical results:", error);
    return [];
  }
}

export async function fetchSpecificResults(
  filename: string
): Promise<BenchmarkData | null> {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch results for ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    return null;
  }
}

export function generateModelSummaries(data: BenchmarkData): ModelSummary[] {
  return Object.entries(data)
    .map(([modelName, modelData]) => {
      const totalCost = modelData.results.reduce(
        (sum, result) => sum + result.cost,
        0
      );
      const averageTokens =
        modelData.results.reduce((sum, result) => sum + result.tokens, 0) /
        modelData.results.length;

      return {
        name: modelName,
        total: modelData.total,
        passCount: modelData.passCount,
        passRate: modelData.passRate,
        totalCost,
        averageTokens: Math.round(averageTokens),
      };
    })
    .sort((a, b) => b.passRate - a.passRate);
}

export function formatTimestamp(timestamp: string): string {
  try {
    // Handle the ISO-like format from filenames
    let date;
    if (timestamp.includes("T")) {
      // Parse ISO-like format: 2025-12-26T11-43-37-400Z
      const cleanTimestamp = timestamp
        .replace("T", " ")
        .replace(/-/g, ":")
        .replace(/Z$/, "");
      date = new Date(cleanTimestamp);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

export function getModelDisplayName(modelName: string): string {
  return (
    modelName
      .split("/")
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) || modelName
  );
}

export async function fetchClues(): Promise<Clue[]> {
  try {
    const response = await fetch("/clues.json");
    if (!response.ok) {
      throw new Error("Failed to fetch clues");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching clues:", error);
    throw error;
  }
}

export function getClueById(clues: Clue[], id: string): Clue | undefined {
  return clues.find((clue) => clue.id === id);
}
