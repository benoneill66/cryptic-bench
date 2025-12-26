import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import BarChart from "../components/BarChart";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Header } from "../components/ui/header";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const router = useRouter();
  const { timestamp } = router.query;

  // Use historical results if timestamp is provided, otherwise use current results
  const apiUrl =
    timestamp && typeof timestamp === "string"
      ? `/api/results/${timestamp}`
      : "/api/results";

  const { data, error } = useSWR(apiUrl, fetcher);

  if (error)
    return (
      <>
        <Header showHistory={true} />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-destructive font-semibold mb-2">
              Error Loading Results
            </h2>
            <p className="text-destructive/80">{String(error)}</p>
          </div>
        </div>
      </>
    );

  if (!data)
    return (
      <>
        <Header showHistory={true} />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading benchmark results...
              </p>
            </div>
          </div>
        </div>
      </>
    );

  // Remove timestamp and filePath from data if present (for historical results)
  const resultsData =
    timestamp && typeof timestamp === "string"
      ? Object.fromEntries(
          Object.entries(data).filter(
            ([key]) => !["timestamp", "filePath"].includes(key)
          )
        )
      : data;

  const models = Object.entries(resultsData).map(([model, v]: any) => ({
    model,
    ...v,
  }));
  models.sort((a: any, b: any) => b.passRate - a.passRate);

  const labels = models.map((m: any) => m.model);
  const values = models.map((m: any) => m.passRate);

  const displayTimestamp =
    timestamp && typeof timestamp === "string"
      ? new Date(timestamp).toLocaleString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : null;

  return (
    <>
      <Header showHistory={true} currentTimestamp={displayTimestamp} />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Cryptic Benchmark Results
          </h1>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span>📊 {models.length} Models Tested</span>
            {displayTimestamp && (
              <>
                <span>•</span>
                <span>🕒 Viewing from {displayTimestamp}</span>
              </>
            )}
          </div>
        </div>

        <section className="mb-8">
          <BarChart labels={labels} values={values} />
        </section>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Model Performance</h2>
          <table className="models-table w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">#</th>
                <th className="text-left py-3 px-4 font-medium">Model</th>
                <th className="text-left py-3 px-4 font-medium">Pass Rate</th>
                <th className="text-left py-3 px-4 font-medium">Pass</th>
                <th className="text-left py-3 px-4 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m: any, i: number) => (
                <tr
                  key={m.model}
                  className="border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/model/${encodeURIComponent(m.model)}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {m.model}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${m.passRate * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {(m.passRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-green-600 font-medium">
                    {m.passCount}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!displayTimestamp && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              href="/history"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              📈 View Historical Results
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
