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
import { Header } from "../components/ui/header";

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
      <>
        <Header />
        <div className="container mx-auto px-6 py-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <h2 className="text-destructive font-semibold mb-2">
                Error Loading History
              </h2>
              <p className="text-destructive/80">{String(error)}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );

  if (!data)
    return (
      <>
        <Header />
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading history...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );

  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            📋 Results History
          </h1>
          <p className="text-muted-foreground">
            {data.files.length} result files available
          </p>
        </div>

        <div className="grid gap-6">
          {data.files.map((file, index) => (
            <Card
              key={file.timestamp}
              className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {formatTimestamp(file.timestamp)}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span>
                          🕒 Modified: {formatTimestamp(file.modifiedTime)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      {formatFileSize(file.size)}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {file.filename}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Link href={`/?timestamp=${file.timestamp}`}>
                    <Button className="flex-1">📊 View Results</Button>
                  </Link>
                  <Link href={`/api/results/${file.timestamp}`} target="_blank">
                    <Button variant="outline" className="flex-1">
                      💾 Download JSON
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
