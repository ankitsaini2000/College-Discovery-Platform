#!/usr/bin/env node
import { runEnrichmentPipeline } from "./pipeline"
import { parseArgs } from "util"

async function main() {
  const args = process.argv.slice(2)
  const help = args.includes("--help") || args.includes("-h")

  if (help) {
    console.log(`
College Data Enrichment Pipeline

Usage: npx ts-node --project scripts/tsconfig.json -- scripts/scraper/index.ts [options]

Options:
  --concurrency <n>   Max concurrent requests (default: 3)
  --delay <ms>        Delay between requests in ms (default: 2000)
  --resume            Resume from last checkpoint
  --no-resume         Start fresh (clear cache)
  --help, -h          Show this help

Examples:
  npx ts-node --project scripts/tsconfig.json -- scripts/scraper/index.ts --concurrency=5 --delay=1000
  npx ts-node --project scripts/tsconfig.json -- scripts/scraper/index.ts --resume
    `)
    process.exit(0)
  }

  const config: Record<string, unknown> = {}

  for (const arg of args) {
    const [key, val] = arg.split("=")
    if (key === "--concurrency") config.maxConcurrency = parseInt(val)
    if (key === "--delay") config.requestDelayMs = parseInt(val)
    if (key === "--resume") config.resume = true
    if (key === "--no-resume") config.resume = false
  }

  await runEnrichmentPipeline(config)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
