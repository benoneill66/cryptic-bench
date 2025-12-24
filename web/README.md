# Cryptic Bench Visualizer

This small Next.js app visualizes benchmark results produced by the `cryptic-bench` tool.

## Running locally

1. Install dependencies in `web/` (using Bun):

   bun install

2. Run dev server:

   bun run dev

3. Open http://localhost:3000

The API route `/api/results` will read `results_test.json` if present, otherwise `results.json` in the repo root.
Note: running the benchmark now automatically writes a copy of results into `web/data/` (as `results.json` and `results_test.json` for test runs), so the visualizer will pick up results without copying files manually.
