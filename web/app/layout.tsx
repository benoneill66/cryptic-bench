import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cryptic Crossword Benchmark Results",
  description: "Performance analysis of AI models on cryptic crossword clues",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="cryptic-bench-theme">
          <div className="min-h-screen bg-background">
            {/* Header with theme toggle */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">
                  Cryptic Crossword Benchmark
                </h1>
                <ThemeToggle />
              </div>
            </header>

            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
