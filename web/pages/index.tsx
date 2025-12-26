import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import BarChart from "../components/BarChart";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

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
      <div className="container">
        <div className="flex justify-end mb-4">
          <Link href="/history">
            <Button variant="outline">View History</Button>
          </Link>
        </div>
        <h1>Cryptic Benchmark Results</h1>
        <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-4 mt-4">
          Failed to load: {String(error)}
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="container">
        <div className="flex justify-end mb-4">
          <Link href="/history">
            <Button variant="outline">View History</Button>
          </Link>
        </div>
        <h1>Cryptic Benchmark Results</h1>
        <div>Loading...</div>
      </div>
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
    <div className="container">
      <div className="flex justify-end mb-4">
        <Link href="/history">
          <Button variant="outline">View History</Button>
        </Link>
      </div>
      <h1>Cryptic Benchmark Results</h1>
      {displayTimestamp && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 flex items-center gap-3">
          <span>
            Viewing results from: <strong>{displayTimestamp}</strong>
          </span>
          <Link href="/">
            <Button size="sm" variant="secondary">
              View Current
            </Button>
          </Link>
        </div>
      )}
      <p>Models: {models.length}</p>

      <section style={{ marginTop: 18 }}>
        <BarChart labels={labels} values={values} />
      </section>

      <table className="models-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Model</th>
            <th>Pass Rate</th>
            <th>Pass</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m: any, i: number) => (
            <tr key={m.model}>
              <td>{i + 1}</td>
              <td>
                <Link href={`/model/${encodeURIComponent(m.model)}`}>
                  {m.model}
                </Link>
              </td>
              <td>{(m.passRate * 100).toFixed(2)}%</td>
              <td>{m.passCount}</td>
              <td>{m.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!displayTimestamp && (
        <div className="mt-8 pt-4 border-t border-border text-center">
          <Link
            href="/history"
            className="text-primary hover:underline font-medium"
          >
            View Historical Results
          </Link>
        </div>
      )}

      <style jsx>{`
        .navigation {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }

        .btn-history {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }

        .btn-history:hover {
          background: #545b62;
        }

        .timestamp-info {
          background: #e3f2fd;
          border: 1px solid #bbdefb;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-current {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background-color 0.2s;
        }

        .btn-current:hover {
          background: #1e7e34;
        }

        .history-link {
          margin-top: 2rem;
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .history-link a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }

        .history-link a:hover {
          text-decoration: underline;
        }

        .error {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
