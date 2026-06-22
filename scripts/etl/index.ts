/**
 * College Discovery Platform — ETL Pipeline CLI
 *
 * Usage:
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/etl/index.ts
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/etl/index.ts --dry-run
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/etl/index.ts --sources inline,aishe,aicte-data
 *
 * Options:
 *   --dry-run        Validate without writing to DB
 *   --sources        Comma-separated list: inline, aicte, nirf, aishe, aicte-data (default: inline)
 *   --api-key        data.gov.in API key (or set DATA_GOV_IN_API_KEY env var)
 */

import { runPipeline } from "./pipeline"

type SourceName = "inline" | "aicte" | "nirf" | "aishe" | "aicte-data"

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")

  const sourcesArg = args.find((a) => a.startsWith("--sources="))
  const sourcesIdx = args.indexOf("--sources")
  const sourcesNext = sourcesIdx >= 0 && sourcesIdx + 1 < args.length && !args[sourcesIdx + 1].startsWith("--") ? args[sourcesIdx + 1] : undefined
  const sourcesRaw = sourcesArg ? sourcesArg.split("=")[1] : sourcesNext || "inline"
  const sources: SourceName[] = sourcesRaw.split(",") as SourceName[]

  const apiKeyArg = args.find((a) => a.startsWith("--api-key="))
  if (apiKeyArg) {
    process.env.DATA_GOV_IN_API_KEY = apiKeyArg.split("=")[1]
  }

  const startTime = Date.now()

  try {
    const { sourcesUsed, summary } = await runPipeline({ sources, dryRun })

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`\n══════════════════════════════════════`)
    console.log(`  Pipeline complete in ${elapsed}s`)
    console.log(`  Sources: ${sourcesUsed.join(", ")}`)
    console.log(`  Colleges created:  ${summary.collegesCreated}`)
    console.log(`  Colleges updated:  ${summary.collegesUpdated}`)
    console.log(`  Colleges skipped:  ${summary.collegesSkipped}`)
    console.log(`  Courses created:   ${summary.coursesCreated}`)
    console.log(`  Placements created:${summary.placementsCreated}`)
    console.log(`  Cutoffs created:   ${summary.cutoffsCreated}`)
    if (summary.errors.length > 0) {
      console.log(`\n  Errors (${summary.errors.length}):`)
      for (const err of summary.errors.slice(0, 10)) {
        console.log(`    ⚠ ${err}`)
      }
      if (summary.errors.length > 10) console.log(`    ... and ${summary.errors.length - 10} more`)
    }
    console.log(`══════════════════════════════════════\n`)
  } catch (err) {
    console.error("Pipeline failed:", err)
    process.exit(1)
  }
}

main()
