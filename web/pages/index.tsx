import useSWR from "swr";
import Link from "next/link";
import BarChart from "../components/BarChart";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const { data, error } = useSWR("/api/results", fetcher);

  if (error)
    return <div className="container">Failed to load: {String(error)}</div>;
  if (!data) return <div className="container">Loading...</div>;

  const models = Object.entries(data).map(([model, v]: any) => ({
    model,
    ...v,
  }));
  models.sort((a: any, b: any) => b.passRate - a.passRate);

  const labels = models.map((m: any) => m.model);
  const values = models.map((m: any) => m.passRate);

  return (
    <div className="container">
      <h1>Cryptic Benchmark Results</h1>
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
    </div>
  );
}
