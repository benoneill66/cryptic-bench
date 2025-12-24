import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const data = {
    labels,
    datasets: [
      {
        label: "Pass Rate %",
        data: values.map((v) => Number((v * 100).toFixed(2))),
        backgroundColor: "rgba(110,231,183,0.8)",
      },
    ],
  };
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
