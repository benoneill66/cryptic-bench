"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchLatestResults, getModelDisplayName } from "@/lib/data";
import { BenchmarkData, BenchmarkResult } from "@/types/benchmark";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelName = decodeURIComponent(params.model as string);

  const [data, setData] = useState<BenchmarkData | null>(null);
  const [modelData, setModelData] = useState<BenchmarkResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const latestData = await fetchLatestResults();
        setData(latestData);

        if (latestData[modelName]) {
          setModelData(latestData[modelName].results);
        } else {
          setError(`Model "${modelName}" not found`);
        }
      } catch (err) {
        setError("Failed to load model data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (modelName) {
      loadData();
    }
  }, [modelName]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading model details...</div>
        </div>
      </div>
    );
  }

  if (error || !data || !modelData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">
            {error || "Model data not found"}
          </div>
        </div>
      </div>
    );
  }

  const modelSummary = data[modelName];
  const totalCost = modelData.reduce((sum, result) => sum + result.cost, 0);
  const totalTokens = modelData.reduce((sum, result) => sum + result.tokens, 0);
  const averageTokens = Math.round(totalTokens / modelData.length);

  const correctAnswers = modelData.filter((r) => r.pass);
  const incorrectAnswers = modelData.filter((r) => !r.pass);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              {getModelDisplayName(modelName)}
            </h1>
            <p className="text-xl text-muted-foreground">
              Detailed performance breakdown
            </p>
          </div>
          <Badge
            variant={
              modelSummary.passRate > 0.5
                ? "success"
                : modelSummary.passRate > 0.2
                ? "warning"
                : "destructive"
            }
          >
            {Math.round(modelSummary.passRate * 100)}% Success Rate
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{modelSummary.total}</div>
            <p className="text-sm text-muted-foreground">
              Cryptic crossword clues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Correct Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {correctAnswers.length}
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round(modelSummary.passRate * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalCost.toFixed(4)}</div>
            <p className="text-sm text-muted-foreground">API usage cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Average Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageTokens}</div>
            <p className="text-sm text-muted-foreground">Per response</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Correct Answers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Correct Answers ({correctAnswers.length})
            </CardTitle>
            <CardDescription>
              Clues that were answered correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {correctAnswers.map((result, index) => (
                <div
                  key={result.clueId}
                  className="p-4 border border-green-200 bg-green-50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm text-green-800">
                      Clue {result.clueId}
                    </span>
                    <Badge variant="success">Score: {result.score}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Answer:</span>{" "}
                      {result.answer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tokens:</span>{" "}
                      {result.tokens} •
                      <span className="font-medium"> Cost:</span> $
                      {result.cost.toFixed(6)}
                    </p>
                    {result.raw && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                          View reasoning
                        </summary>
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <pre className="whitespace-pre-wrap">
                            {result.raw}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incorrect Answers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              Incorrect Answers ({incorrectAnswers.length})
            </CardTitle>
            <CardDescription>
              Clues that were answered incorrectly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {incorrectAnswers.map((result, index) => (
                <div
                  key={result.clueId}
                  className="p-4 border border-red-200 bg-red-50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm text-red-800">
                      Clue {result.clueId}
                    </span>
                    <Badge variant="destructive">Score: {result.score}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Answer:</span>{" "}
                      {result.answer || "No answer provided"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tokens:</span>{" "}
                      {result.tokens} •
                      <span className="font-medium"> Cost:</span> $
                      {result.cost.toFixed(6)}
                    </p>
                    {result.raw && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                          View reasoning
                        </summary>
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <pre className="whitespace-pre-wrap">
                            {result.raw}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
