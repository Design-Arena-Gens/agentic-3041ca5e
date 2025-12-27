# Daily Intelligence Agent

Autonomous Next.js dashboard and reporting agent that digests learning platform snapshots, detects deltas, and delivers a publication-ready daily brief covering resource updates, session activity, and individual student momentum.

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to review the latest synthesized report. Data is sourced from JSON snapshots in `data/snapshots`.

## Generate Daily Markdown

```bash
npm run generate:report
```

The command calculates the delta between the two most recent snapshots and writes `reports/<date>.md` plus `reports/latest.md`, suitable for emailing or archiving.

## Project Structure

```
app/                    # App Router UI + API endpoints
data/snapshots/         # Daily platform exports (JSON snapshots)
lib/                    # Data loading + reporting logic
reports/                # Generated Markdown summaries
scripts/                # CLI automation
```

## API Surface

- `GET /api/report` — JSON payload for the latest daily report
- `GET /api/report?format=markdown` — Markdown version for download

## Deploy

```bash
npm run build
```

Deploy the `.next` output (compatible with Vercel serverless). The runtime reads bundled snapshots, computes reports on demand, and ships static Markdown via the API.
