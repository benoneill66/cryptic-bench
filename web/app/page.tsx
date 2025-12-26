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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  fetchLatestResults,
  generateModelSummaries,
  getModelDisplayName,
} from "@/lib/data";
import { BenchmarkData, ModelSummary } from "@/types/benchmark";
import Link from "next/link";

export default function Dashboard() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [summaries, setSummaries] = useState<ModelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const latestData = await fetchLatestResults();
        setData(latestData);
        setSummaries(generateModelSummaries(latestData));
      } catch (err) {
        setError("Failed to load benchmark data");
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
          <div className="text-lg">Loading benchmark results...</div>
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

  if (!data || summaries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">No data available</div>
        </div>
      </div>
    );
  }

  const chartData = summaries.map((summary) => ({
    name: getModelDisplayName(summary.name),
    fullName: summary.name,
    passRate: Math.round(summary.passRate * 100),
    totalTests: summary.total,
    passedTests: summary.passCount,
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Models Tested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summaries.length}</div>
            <p className="text-sm text-muted-foreground">
              Different AI models evaluated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {getModelDisplayName(summaries[0]?.name || "")}
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round((summaries[0]?.passRate || 0) * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Average Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(
                (summaries.reduce((sum, s) => sum + s.passRate, 0) /
                  summaries.length) *
                  100
              )}
              %
            </div>
            <p className="text-sm text-muted-foreground">Across all models</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Comparison</CardTitle>
          <CardDescription>
            Success rate (%) for each AI model on cryptic crossword clues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fill: "hsl(var(--foreground))" }}
                  axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))" }}
                  axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}%`,
                    name === "passRate" ? "Success Rate" : name,
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="passRate" fill="#3b82f6" name="Success Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Model Details */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Details</CardTitle>
          <CardDescription>
            Detailed breakdown of each model's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaries.map((summary) => (
              <div
                key={summary.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {getModelDisplayName(summary.name)}
                    </h3>
                    <Badge
                      variant={
                        summary.passRate > 0.5
                          ? "success"
                          : summary.passRate > 0.2
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {Math.round(summary.passRate * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {summary.passCount} / {summary.total} correct answers
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cost: ${summary.totalCost.toFixed(4)} • Avg tokens:{" "}
                    {summary.averageTokens}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/model/${encodeURIComponent(summary.name)}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Results */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Results</CardTitle>
          <CardDescription>
            Browse benchmark results from previous runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/historical">View Historical Results</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
