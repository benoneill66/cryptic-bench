import Link from "next/link";
import { Button } from "./button";
import { Separator } from "./separator";
import { Badge } from "./badge";

interface HeaderProps {
  showHistory?: boolean;
  currentTimestamp?: string | null;
}

export function Header({
  showHistory = false,
  currentTimestamp = null,
}: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Cryptic Bench</h1>
                <p className="text-xs text-slate-400">Benchmark Results</p>
              </div>
            </Link>

            {currentTimestamp && (
              <>
                <Separator
                  orientation="vertical"
                  className="h-8 bg-slate-600"
                />
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-slate-200"
                >
                  Historical View
                </Badge>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {showHistory && (
              <Link href="/history">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  📊 History
                </Button>
              </Link>
            )}

            {currentTimestamp && (
              <Link href="/">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Current Results
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
