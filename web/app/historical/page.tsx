"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchHistoricalResults,
  formatTimestamp,
  generateModelSummaries,
  getModelDisplayName,
} from "@/lib/data";
import { HistoricalResultFile } from "@/types/benchmark";
import Link from "next/link";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";

export default function HistoricalPage() {
  const [historicalData, setHistoricalData] = useState<HistoricalResultFile[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchHistoricalResults();
        setHistoricalData(data);
      } catch (err) {
        setError("Failed to load historical data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading historical results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/" className="inline-block">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl font-bold">Historical Benchmark Results</h1>
          <p className="text-xl text-muted-foreground">
            Browse benchmark results from previous runs
          </p>
        </div>
      </div>

      {historicalData.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-lg">No historical data available</p>
              <p className="text-sm text-muted-foreground">
                Historical results will appear here as benchmark runs are
                completed
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Total Runs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {historicalData.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Benchmark test runs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Latest Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historicalData.length > 0 && (
                  <>
                    <div className="text-3xl font-bold">
                      {Math.round(
                        generateModelSummaries(historicalData[0].data)[0]
                          ?.passRate * 100
                      )}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Best model in latest run
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                {historicalData.length > 0 && (
                  <>
                    <div className="text-lg font-semibold">
                      {formatTimestamp(
                        historicalData[historicalData.length - 1].timestamp
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">to</p>
                    <div className="text-lg font-semibold">
                      {formatTimestamp(historicalData[0].timestamp)}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Results List */}
          <Card>
            <CardHeader>
              <CardTitle>All Historical Results</CardTitle>
              <CardDescription>
                Detailed view of each benchmark run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicalData.map((run, index) => {
                  const summaries = generateModelSummaries(run.data);
                  const bestModel = summaries[0];
                  const totalModels = summaries.length;

                  return (
                    <div
                      key={run.filename}
                      className="p-6 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">
                            Run {historicalData.length - index}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(run.timestamp)}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {totalModels} models
                            </Badge>
                            {bestModel && (
                              <Badge
                                variant={
                                  bestModel.passRate > 0.5
                                    ? "success"
                                    : "warning"
                                }
                              >
                                Best: {Math.round(bestModel.passRate * 100)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Model Performance Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {summaries.slice(0, 6).map((summary) => (
                          <div
                            key={summary.name}
                            className="p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">
                                {getModelDisplayName(summary.name)}
                              </span>
                              <Badge
                                variant={
                                  summary.passRate > 0.5
                                    ? "success"
                                    : summary.passRate > 0.2
                                    ? "warning"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {Math.round(summary.passRate * 100)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {summary.passCount}/{summary.total} correct
                            </p>
                          </div>
                        ))}
                        {summaries.length > 6 && (
                          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                              +{summaries.length - 6} more models
                            </span>
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="flex justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/historical/${encodeURIComponent(
                              run.filename
                            )}`}
                          >
                            View Full Results
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
