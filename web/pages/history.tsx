import useSWR from "swr";
import Link from "next/link";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface HistoryEntry {
  timestamp: string;
  filename: string;
  filePath: string;
  size: number;
  modifiedTime: string;
}

interface HistoryData {
  dataDir: string;
  files: HistoryEntry[];
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function History() {
  const { data, error } = useSWR<HistoryData>("/api/history", fetcher);

  if (error)
    return (
      <div className="container">
        <h1>Results History</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Failed to load history: {String(error)}
            </p>
          </CardContent>
        </Card>
      </div>
    );

  if (!data)
    return (
      <div className="container">
        <h1>Results History</h1>
        <Card>
          <CardContent className="pt-6">
            <p>Loading history...</p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Results History</h1>
          <p className="text-muted-foreground">
            Available result files: {data.files.length}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">← Back to Current Results</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {data.files.map((file) => (
          <Card
            key={file.timestamp}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {formatTimestamp(file.timestamp)}
                </CardTitle>
                <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
              </div>
              <CardDescription>
                Modified: {formatTimestamp(file.modifiedTime)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href={`/?timestamp=${file.timestamp}`}>
                  <Button size="sm">View Results</Button>
                </Link>
                <Link href={`/api/results/${file.timestamp}`} target="_blank">
                  <Button variant="outline" size="sm">
                    Download JSON
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
