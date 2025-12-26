# Cryptic Crossword Benchmark Results

A modern Next.js web application to display and analyze the results of AI models performing on cryptic crossword clues.

## Features

- **Dashboard Overview**: See the latest benchmark results with interactive bar charts
- **Model Details**: Click into individual models to see detailed breakdowns of their performance
- **Historical Results**: Browse and compare results from previous benchmark runs
- **Modern UI**: Built with shadcn/ui components for a sleek, professional appearance
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Recharts** - Interactive data visualization
- **Bun** - Fast package manager

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) package manager installed

### Installation

1. Navigate to the web directory:

   ```bash
   cd web
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
bun run build
bun run start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Dashboard homepage
│   ├── globals.css        # Global styles
│   ├── historical/        # Historical results pages
│   └── model/             # Model detail pages
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   └── data.ts          # Data fetching utilities
├── types/                # TypeScript type definitions
│   └── benchmark.ts     # Benchmark data types
├── public/              # Static assets
│   └── data/           # Benchmark result JSON files
└── package.json        # Dependencies and scripts
```

## Data Structure

The application reads benchmark results from JSON files in the `public/data/` directory. Each file contains:

- **Model Results**: Performance data for different AI models
- **Individual Answers**: Detailed breakdown of each clue and response
- **Metadata**: Tokens used, costs, scoring

## Features Detail

### Dashboard

information- Overview statistics (total models, best performer, average success rate)

- Interactive bar chart showing model performance comparison
- Detailed model cards with performance metrics
- Links to model details and historical results

### Model Details

- Individual model performance summary
- Breakdown of correct vs incorrect answers
- Detailed answer comparison with reasoning
- Cost and token usage analytics

### Historical Results

- Timeline of all benchmark runs
- Performance comparison across different time periods
- Detailed analysis of each historical run
- Links to compare models across different runs

## Customization

### Adding New Models

Simply add new result files to the `public/data/` directory following the existing JSON structure.

### Styling

- Modify `tailwind.config.js` for global theme changes
- Update `app/globals.css` for custom CSS variables
- Customize individual components in the `components/ui/` directory

### Data Sources

- Modify `lib/data.ts` to change how data is fetched and processed
- Update the historical file list in `fetchHistoricalResults()` function

## Contributing

1. Follow the existing code structure and conventions
2. Use TypeScript for type safety
3. Test thoroughly before submitting changes
4. Ensure responsive design for mobile compatibility

## License

This project is part of the Cryptic Crossword Benchmark analysis suite.
