import type { Clue } from "./types";

export function normalize(s: string) {
  return s.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function levenshtein(a: string, b: string): number {
  const A = a.split("");
  const B = b.split("");
  const m = A.length;
  const n = B.length;
  const dp: number[][] = new Array(m + 1)
    .fill(null)
    .map(() => new Array<number>(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const a = dp[i - 1]![j] ?? 0;
      const b = dp[i]![j - 1] ?? 0;
      const c = dp[i - 1]![j - 1] ?? 0;
      dp[i]![j] = Math.min(a + 1, b + 1, c + (A[i - 1] === B[j - 1] ? 0 : 1));
    }
  }

  const v = dp[m]![n];
  return typeof v === "number" ? v : 0;
}

export function scoreAnswer(expected: string, got: string) {
  const e = normalize(expected);
  const g = normalize(got);
  if (!g) return 0;
  if (e === g) return 1;
  if (g.includes(e) || e.includes(g)) return 0.8;
  const dist: number = levenshtein(e, g);
  if (dist === 1) return 0.6;
  if (dist === 2) return 0.4;
  return 0;
}

// New: pass/fail judgement for answers. Returns true if the answer should be
// considered correct. This is intentionally conservative (exact match or
// inclusion or small edit distance).
export function isPass(expected: string, got: string) {
  const e = normalize(expected);
  const g = normalize(got);
  if (!g) return false;
  if (e === g) return true; // exact match
  // If one contains the other (e.g., short answers or minor format differences)
  if (g.includes(e) || e.includes(g)) return true;
  // Allow small typo for longer words
  const dist = levenshtein(e, g);
  if (e.length <= 2) return false; // be strict for very short answers
  return dist <= 1;
}

export function prettyPercent(n: number) {
  return `${Math.round(n * 100)}%`;
}
