# cryptic-bench

To install dependencies:

```bash
bun install
```

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

- Run the benchmark for the default model (you can pass models):

```bash
bun run src/index.ts --models=openai/gpt-4o,google/gemini-3
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

If you'd like, I can add CSV/JSON exporters, more advanced scoring (e.g., synonyms), or a test harness for running many models in parallel. ✅
