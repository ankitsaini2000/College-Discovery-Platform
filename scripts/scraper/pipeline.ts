import { PrismaClient } from "@prisma/client"
import { ScrapedCollege, ScraperConfig, DEFAULT_CONFIG, ProgressCallback } from "./types"
import { scrapeCollegedunia } from "./sources/collegedunia"
import { scrapeCollegeduniaAPI, loadCachedApiResults } from "./sources/collegedunia-api"
import { scrapeShiksha } from "./sources/shiksha"
import { matchAndEnrich } from "./matcher"
import { mkdirSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

async function getAllStates(): Promise<string[]> {
  const result = await prisma.college.findMany({
    select: { state: true },
    distinct: ["state"],
    orderBy: { state: "asc" },
  })
  return result.map((r) => r.state).filter(Boolean) as string[]
}

async function getCollegeCount(): Promise<number> {
  return prisma.college.count()
}

async function getEnrichmentStats(): Promise<{ withFees: number; withWebsite: number; withEmail: number; withPhone: number; withPlacements: number }> {
  const [withFees, withWebsite, withEmail, withPhone, withPlacements] = await Promise.all([
    prisma.college.count({ where: { fees: { gt: 0 } } }),
    prisma.college.count({ where: { website: { not: null } } }),
    prisma.college.count({ where: { email: { not: null } } }),
    prisma.college.count({ where: { phone: { not: null } } }),
    prisma.placement.groupBy({ by: ["collegeId"] }).then((r) => r.length),
  ])
  return { withFees, withWebsite, withEmail, withPhone, withPlacements }
}

function makeProgressHandler(config: ScraperConfig): ProgressCallback {
  let lastMsg = ""
  return (current: number, total: number, message: string) => {
    if (message !== lastMsg) {
      const pct = total > 0 ? Math.round((current / total) * 100) : 0
      console.log(`  [${pct}%] ${message}`)
      lastMsg = message
    }
  }
}

export async function runEnrichmentPipeline(config: Partial<ScraperConfig> = {}): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const onProgress = makeProgressHandler(cfg)

  // Ensure output dir
  if (!existsSync(cfg.outputDir)) {
    mkdirSync(cfg.outputDir, { recursive: true })
  }

  console.log("=== College Data Enrichment Pipeline ===\n")

  // Get current stats
  const total = await getCollegeCount()
  const before = await getEnrichmentStats()
  console.log(`Total colleges in DB: ${total}`)
  console.log(`Before enrichment:`)
  console.log(`  Fees: ${before.withFees}, Website: ${before.withWebsite}, Email: ${before.withEmail}`)
  console.log(`  Phone: ${before.withPhone}, Placements: ${before.withPlacements}\n`)

  // Get states
  const states = await getAllStates()
  console.log(`States to scrape: ${states.length}`)
  if (states.length === 0) {
    console.log("No states found in DB. Run ETL first.")
    return
  }

  // === Step 1: Collegedunia API (fast JSON) ===
  console.log("\n--- Step 1: Collegedunia API ---")
  let allScraped: ScrapedCollege[] = []
  let apiCount = 0
  let apiErrors: string[] = []

  // Try loading cached results first
  const cachedResults = loadCachedApiResults()
  if (cachedResults && cachedResults.length > 0) {
    console.log(`  Loaded ${cachedResults.length} cached API results. Skipping API fetch.`)
    allScraped.push(...cachedResults)
    apiCount = cachedResults.length
  } else {
    const cdApiResult = await scrapeCollegeduniaAPI(states, onProgress)
    console.log(`  API found: ${cdApiResult.colleges.length} colleges, ${cdApiResult.errors.length} errors`)
    allScraped.push(...cdApiResult.colleges)
    apiCount = cdApiResult.colleges.length
    apiErrors = cdApiResult.errors
  }

  // Only run HTML scraping if API didn't find enough
  if (apiCount < 100) {
    console.log("\n--- Step 2: Collegedunia HTML (fallback) ---")
    const cdResult = await scrapeCollegedunia(states, onProgress)
    console.log(`  HTML found: ${cdResult.colleges.length} colleges`)
    allScraped.push(...cdResult.colleges)
  }

  // === Step 3: Shiksha ===
  if (allScraped.length < 500) {
    console.log("\n--- Step 3: Shiksha ---")
    const shResult = await scrapeShiksha(states, onProgress)
    console.log(`  Found: ${shResult.colleges.length} colleges, ${shResult.errors.length} errors`)
    allScraped.push(...shResult.colleges)
  }

  // === Step 4: Match & Enrich ===
  console.log("\n--- Step 4: Matching & Enrichment ---")
  console.log(`  Total scraped records: ${allScraped.length}`)

  const { matched, enriched } = await matchAndEnrich(prisma, allScraped)
  console.log(`  Matched to DB colleges: ${matched}`)
  console.log(`  Enriched:`)
  console.log(`    Fees: ${enriched.fees.length}`)
  console.log(`    Placements: ${enriched.placements.length}`)
  console.log(`    Contacts: ${enriched.contacts.length}`)

  // === Save results ===
  const after = await getEnrichmentStats()
  const summary = {
    before,
    after,
    scraped: {
      collegeduniaApi: apiCount,
      total: allScraped.length,
    },
    matched,
    enriched,
    errors: apiErrors,
    timestamp: new Date().toISOString(),
  }
  writeFileSync(join(cfg.outputDir, "enrichment-summary.json"), JSON.stringify(summary, null, 2))
  console.log(`\nSummary saved to ${cfg.outputDir}/enrichment-summary.json`)

  console.log(`\nAfter enrichment:`)
  console.log(`  Fees: ${before.withFees} → ${after.withFees} (+${after.withFees - before.withFees})`)
  console.log(`  Website: ${before.withWebsite} → ${after.withWebsite} (+${after.withWebsite - before.withWebsite})`)
  console.log(`  Email: ${before.withEmail} → ${after.withEmail} (+${after.withEmail - before.withEmail})`)
  console.log(`  Phone: ${before.withPhone} → ${after.withPhone} (+${after.withPhone - before.withPhone})`)
  console.log(`  Placements: ${before.withPlacements} → ${after.withPlacements} (+${after.withPlacements - before.withPlacements})`)

  await prisma.$disconnect()
}
