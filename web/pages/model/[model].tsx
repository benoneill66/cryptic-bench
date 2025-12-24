import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import BarChart from "../../components/BarChart";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ModelPage() {
  const router = useRouter();
  const { model } = router.query;
  const { data, error } = useSWR("/api/results", fetcher);

  if (error)
    return <div className="container">Failed to load: {String(error)}</div>;
  if (!data) return <div className="container">Loading...</div>;

  const modelKey = String(model || "");
  const m = data[modelKey];
  if (!m) return <div className="container">Model not found: {modelKey}</div>;

  return (
    <div className="container">
      <h1>{modelKey}</h1>
      <p>
        Pass Rate: {(m.passRate * 100).toFixed(2)}% — {m.passCount}/{m.total}
      </p>
      <div style={{ maxWidth: 600, marginBottom: 16 }}>
        <BarChart labels={[modelKey]} values={[m.passRate]} />
      </div>
      <Link href="/">← Back</Link>

      <h2>Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Clue ID</th>
            <th>Answer</th>
            <th>Pass</th>
            <th>Score</th>
            <th>Tokens</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {m.results.map((r: any, i: number) => (
            <tr key={r.clueId + "-" + i}>
              <td>{i + 1}</td>
              <td>{r.clueId}</td>
              <td>{r.answer}</td>
              <td>{r.pass ? "✅" : "❌"}</td>
              <td>
                {(r.score ?? 0).toFixed ? (r.score ?? 0).toFixed(2) : r.score}
              </td>
              <td>{r.tokens ?? "-"}</td>
              <td>{r.cost ? `$${Number(r.cost).toFixed(6)}` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
