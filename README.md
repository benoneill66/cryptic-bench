# cryptic-bench-monorepo

A monorepo containing a CLI tool for benchmarking LLMs on cryptic crossword clues and a Next.js web visualizer.

## Project Structure

- **Root**: CLI tool and benchmark logic
- **web/**: Next.js web application for visualizing results
- **packages/shared/**: Shared TypeScript types and utilities

## Setup

```bash
# Install all dependencies at once
bun install
```

This uses Bun workspaces to manage dependencies across all packages.

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## cryptic-bench

This tool benchmarks LLMs (via OpenRouter) on a set of crossword clues. It runs each model over a set of clues and reports accuracy and average score.

### Setup

- Install dependencies with Bun:

```bash
bun install
```

- Set your OpenRouter API key in the environment:

```bash
export OPENROUTER_API_KEY="sk-..."
```

The CLI will automatically load variables from a `.env` file if present. Copy `.env.example` to `.env` and update the value.

### Usage

#### CLI Tool

Run benchmarks from the root:

```bash
# Run a set of models explicitly:
bun run src/index.ts --models=openai/gpt-4o,google/gemini-3

# Or use the built-in `models.json` list (default). To point at another list:
bun run src/index.ts --models-file=./my-models.json

# Quick smoke test mode (runs a single small model):
bun run src/index.ts --mode=test
OR
bun run src/index.ts --test
```

#### Web Visualizer

Start the Next.js development server:

```bash
bun run dev:web
```

Open http://localhost:3000 to view results (the app reads `results_test.json` if present, otherwise `results.json`).

#### Development Scripts

```bash
# Install dependencies for all packages
bun run install:all

# Run CLI tool only
bun run dev:cli

# Run web visualizer only
bun run dev:web

# Run both CLI and web (in parallel)
bun run dev:all

# Build web application
bun run build:web

# Run all builds
bun run build:all
```

Or supply the API key inline (not recommended for security):

```bash
bun run src/index.ts --api-key=sk-... --models=openai/gpt-4o
```

### Clues

Edit `clues/clues.json` to provide cryptic clues and answers. The format is an array of objects:

```json
{ "id": "c1", "clue": "Not yes (2)", "answer": "NO" }
```

Notes:

- This is a starting scaffold — replace the example clues with an authoritative set of cryptic clues and expected answers.
- Scoring is a simple normalized comparison with some tolerance via Levenshtein distance; you can extend `src/scorer.ts` for richer evaluation.

Notes:

- This is a starting scaffold — replace the example clues with an authoritative set of cryptic clues and expected answers.
- Scoring is a simple normalized comparison with some tolerance via Levenshtein distance; you can extend `src/scorer.ts` for richer evaluation.

If you'd like, I can add CSV/JSON exporters, more advanced scoring (e.g., synonyms), or a test harness for running many models in parallel. ✅
