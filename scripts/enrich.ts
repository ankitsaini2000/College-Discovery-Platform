import { PrismaClient } from "@prisma/client"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("=== Tier 1: india-edu-cities-data Enrichment ===\n")

  const rawPath = join(__dirname, "..", "node_modules", "india-edu-cities-data", "src", "colleges.json")
  if (!existsSync(rawPath)) {
    console.log("india-edu-cities-data not found. Skipping.")
    return
  }

  let text = readFileSync(rawPath, "utf-8")
  text = text.replace(/\bNaN\b/g, "null")
  const records: any[] = JSON.parse(text)
  console.log(`Loaded ${records.length} records\n`)

  // Load all DB colleges into Map for fast lookup
  console.log("Loading DB colleges...")
  const allColleges = await prisma.college.findMany({
    select: { id: true, name: true, city: true, fees: true },
  })
  const dbByName = new Map<string, typeof allColleges[0]>()
  for (const c of allColleges) {
    const key = c.name.toLowerCase().slice(0, 25)
    // Keep the best match per name prefix
    if (!dbByName.has(key) || c.name.length > dbByName.get(key)!.name.length) {
      dbByName.set(key, c)
    }
  }
  console.log(`DB colleges loaded: ${allColleges.length}\n`)

  // Match records in memory
  const matches: { record: any; college: typeof allColleges[0] }[] = []
  for (const r of records) {
    if (!r.name) continue
    const key = r.name.toLowerCase().substring(0, 25)
    const college = dbByName.get(key)
    if (college) matches.push({ record: r, college })
  }
  console.log(`Matched: ${matches.length}/${records.length}\n`)

  // Batch update fees
  const feeUpdates = matches
    .filter((m) => m.record.fees_ug_inr > 0 && !m.college.fees)
    .map((m) => prisma.college.update({
      where: { id: m.college.id },
      data: { fees: Math.round(m.record.fees_ug_inr) },
    }))
  console.log(`Updating fees: ${feeUpdates.length}...`)
  await Promise.all(feeUpdates)

  // Batch create placements
  const placementData = matches
    .filter((m) => m.record.placement_avg_lpa > 0)
    .map((m) => ({
      collegeId: m.college.id,
      year: 2024,
      averagePackage: Math.round(m.record.placement_avg_lpa * 100000),
      highestPackage: m.record.placement_avg_lpa_max
        ? Math.round(m.record.placement_avg_lpa_max * 100000)
        : Math.round(m.record.placement_avg_lpa * 100000),
      placementRate: m.record.placement_rate_pct || 0,
      topRecruiters: [],
    }))

  // Get existing placements to avoid duplicates
  const existingP = await prisma.placement.findMany({
    where: { collegeId: { in: placementData.map((p) => p.collegeId) }, year: 2024 },
    select: { collegeId: true },
  })
  const existingSet = new Set(existingP.map((p) => p.collegeId))
  const newPlacements = placementData.filter((p) => !existingSet.has(p.collegeId))

  console.log(`Creating placements: ${newPlacements.length}...`)
  for (let i = 0; i < newPlacements.length; i += 100) {
    await prisma.placement.createMany({
      data: newPlacements.slice(i, i + 100),
      skipDuplicates: true,
    })
  }

  // Stats
  const [feesCount, placementsCount] = await Promise.all([
    prisma.college.count({ where: { fees: { gt: 0 } } }),
    prisma.placement.groupBy({ by: ["collegeId"] }).then((r) => r.length),
  ])

  console.log(`\nDone!`)
  console.log(`  Matched: ${matches.length}`)
  console.log(`  Fees updated: ${feeUpdates.length}`)
  console.log(`  Placements created: ${newPlacements.length}`)
  console.log(`\nDB totals now:`)
  console.log(`  Colleges with fees: ${feesCount}`)
  console.log(`  Colleges w/ placements: ${placementsCount}`)

  await prisma.$disconnect()
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1) })
