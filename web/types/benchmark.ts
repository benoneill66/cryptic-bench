export interface BenchmarkResult {
  model: string;
  clueId: string;
  answer: string;
  raw: string;
  score: number;
  pass: boolean;
  tokens: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
}

export interface ModelResults {
  total: number;
  passCount: number;
  passRate: number;
  results: BenchmarkResult[];
}

export interface BenchmarkData {
  [modelName: string]: ModelResults;
}

export interface HistoricalResultFile {
  filename: string;
  timestamp: string;
  data: BenchmarkData;
}

export interface ModelSummary {
  name: string;
  total: number;
  passCount: number;
  passRate: number;
  totalCost: number;
  averageTokens: number;
}
