import { PrismaClient } from "@prisma/client"
import { InlineSource } from "./sources/inline"
import { AICTESource, NIRFSource } from "./sources/aicte"
import { AISHESource } from "./sources/aishe"
import { AICTEDetailSource } from "./sources/aicte-data"
import { normalize } from "./normalizer"
import { DBImporter } from "./importer"
import type { ETLSource, ETLResult, ImportSummary } from "./types"

function mergeResults(results: ETLResult[]): ETLResult {
  const merged: ETLResult = { colleges: [], courses: [], placements: [], cutoffs: [] }
  for (const r of results) {
    merged.colleges.push(...r.colleges)
    merged.courses.push(...r.courses)
    merged.placements.push(...r.placements)
    merged.cutoffs.push(...r.cutoffs)
  }
  return merged
}

export interface PipelineOptions {
  sources?: ("inline" | "aicte" | "nirf" | "aishe" | "aicte-data")[]
  dryRun?: boolean
}

export async function runPipeline(options: PipelineOptions = {}): Promise<{
  sourcesUsed: string[]
  raw: ETLResult
  summary: ImportSummary
}> {
  const sourceList: ETLSource[] = []
  const selected = options.sources || ["inline"]

  if (selected.includes("inline")) sourceList.push(new InlineSource())
  if (selected.includes("aicte")) sourceList.push(new AICTESource())
  if (selected.includes("nirf")) sourceList.push(new NIRFSource())
  if (selected.includes("aishe")) sourceList.push(new AISHESource())
  if (selected.includes("aicte-data")) sourceList.push(new AICTEDetailSource())

  console.log(`\n╔══════════════════════════════════════╗`)
  console.log(`║   College Discovery ETL Pipeline     ║`)
  console.log(`╚══════════════════════════════════════╝`)
  console.log(`Sources: ${sourceList.map((s) => s.name).join(", ")}`)
  console.log(`Dry run: ${options.dryRun ? "YES" : "NO"}`)

  // Step 1: Fetch from all sources
  console.log(`\n── Step 1: Fetching data from sources ──`)
  const results: ETLResult[] = []
  for (const source of sourceList) {
    const result = await source.fetch()
    results.push(result)
    console.log(`  ${source.name}: ${result.colleges.length} colleges, ${result.courses.length} courses`)
  }

  // Step 2: Merge
  console.log(`\n── Step 2: Merging source data ──`)
  const merged = mergeResults(results)
  console.log(`  Total raw: ${merged.colleges.length} colleges, ${merged.courses.length} courses`)

  // Step 3: Normalize (dedup, slug, NIRF rank merge)
  console.log(`\n── Step 3: Normalizing & deduplicating ──`)
  const normalized = normalize(merged)
  console.log(`  Normalized: ${normalized.colleges.length} colleges, ${normalized.courses.length} courses`)

  // Step 4: Import into database
  console.log(`\n── Step 4: Importing into database ──`)
  const prisma = new PrismaClient()
  try {
    const importer = new DBImporter(prisma)
    const summary = await importer.import(
      normalized.colleges,
      normalized.courses,
      normalized.placements,
      normalized.cutoffs,
      options.dryRun
    )
    return { sourcesUsed: sourceList.map((s) => s.name), raw: merged, summary }
  } finally {
    await prisma.$disconnect()
  }
}
