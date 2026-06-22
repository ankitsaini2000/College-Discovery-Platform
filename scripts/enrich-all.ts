import { PrismaClient } from "@prisma/client"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { loadCachedApiResults } from "./scraper/sources/collegedunia-api"

const prisma = new PrismaClient()
const DATA = join(__dirname, "..", "data")

function parseLPA(val: string): number {
  if (!val) return 0
  const s = val.trim().toLowerCase()
  const m = s.match(/(\d+\.?\d*)\s*lpa/)
  if (m) return Math.round(parseFloat(m[1]) * 100000)
  const k = s.match(/(\d+\.?\d*)\s*k/)
  if (k) return Math.round(parseFloat(k[1]) * 1000)
  const n = s.match(/(\d+)/)
  if (n) return parseInt(n[1])
  return 0
}

function parseFee(amount: string): number {
  const s = amount.replace(/,/g, "").trim().toLowerCase()
  const l = s.match(/(\d+\.?\d*)\s*l/i)
  if (l) return Math.round(parseFloat(l[1]) * 100000)
  const n = s.match(/(\d+)/)
  if (n) return parseInt(n[1])
  return 0
}

function extractCollegeId(url: string): string | null {
  const m = url.match(/\/college\/(\d+)/) || url.match(/\/college\/(\d+)-/)
  return m ? m[1] : null
}

async function main() {
  console.log("=== Combined Enrichment ===\n")

  const before = {
    fees: await prisma.college.count({ where: { fees: { gt: 0 } } }),
    website: await prisma.college.count({ where: { website: { not: null } } }),
    phone: await prisma.college.count({ where: { phone: { not: null } } }),
    email: await prisma.college.count({ where: { email: { not: null } } }),
    accred: await prisma.college.count({ where: { accreditation: { not: null } } }),
    placements: await prisma.placement.groupBy({ by: ["collegeId"] }).then(r => r.length),
  }
  console.log("Before:", before)

  // Load all DB colleges into memory
  const allColleges = await prisma.college.findMany({
    select: { id: true, slug: true, name: true, city: true, fees: true, website: true, email: true, phone: true, accreditation: true },
  })
  const bySlug = new Map(allColleges.map(c => [c.slug, c]))
  const byNameCity = new Map<string, typeof allColleges[0]>()
  for (const c of allColleges) {
    const key = c.name.toLowerCase().slice(0, 25) + "|" + c.city.toLowerCase().slice(0, 15)
    if (!byNameCity.has(key) || c.name.length > byNameCity.get(key)!.name.length) {
      byNameCity.set(key, c)
    }
  }

  const cdIdToCollege = new Map<string, typeof allColleges[0]>()
  for (const c of allColleges) {
    const m = c.slug.match(/-(\d+)$/)
    if (m) cdIdToCollege.set(m[1], c)
  }

  // --- Source 1: Collegedunia API cache (20K+ records) ---
  console.log("\n--- Source 1: Collegedunia API Cache ---")
  const apiResults = loadCachedApiResults()
  console.log(`  Loaded ${apiResults?.length || 0} cached API results`)

  // --- Source 2: Webcopy data (104 colleges, rich details) ---
  console.log("\n--- Source 2: Webcopy Data ---")
  let webcopyColleges: any[] = []
  let webcopyFees: any[] = []
  let webcopyPlacements: any[] = []
  let webcopyRecruiters: any[] = []

  if (existsSync(join(DATA, "colleges.json"))) {
    webcopyColleges = JSON.parse(readFileSync(join(DATA, "colleges.json"), "utf-8"))
    webcopyFees = JSON.parse(readFileSync(join(DATA, "fees.json"), "utf-8"))
    webcopyPlacements = JSON.parse(readFileSync(join(DATA, "placements.json"), "utf-8"))
    webcopyRecruiters = JSON.parse(readFileSync(join(DATA, "recruiters.json"), "utf-8"))
  }
  console.log(`  ${webcopyColleges.length} colleges, ${webcopyFees.length} fees, ${webcopyPlacements.length} placements`)

  // Map webcopy URL -> college ID (by CD ID in slug)
  const webcopyMatches = new Map<string, typeof allColleges[0]>()
  for (const rec of webcopyColleges) {
    const cdId = extractCollegeId(rec.college_url)
    if (!cdId) continue
    const col = cdIdToCollege.get(cdId) || byNameCity.get(rec.college_name.toLowerCase().slice(0, 25) + "|" + (rec.city || "").toLowerCase().slice(0, 15))
    if (col) webcopyMatches.set(rec.college_url, col)
  }
  console.log(`  Matched ${webcopyMatches.size} to DB`)

  // --- Process: Webcopy contact details ---
  let ww = 0, wp = 0, we = 0, wa = 0
  for (const [url, col] of webcopyMatches) {
    const rec = webcopyColleges.find(r => r.college_url === url)
    if (!rec) continue
    const updates: any = {}
    if (rec.website && !col.website) { updates.website = rec.website.startsWith("http") ? rec.website : "https://" + rec.website; ww++ }
    if (rec.phone && !col.phone) { updates.phone = rec.phone; wp++ }
    if (rec.email && !col.email) { updates.email = rec.email; we++ }
    if (Object.keys(updates).length) await prisma.college.update({ where: { id: col.id }, data: updates })
    // NAAC grade
    if (rec.naac_grade && !col.accreditation) {
      await prisma.college.update({ where: { id: col.id }, data: { accreditation: rec.naac_grade } })
      wa++
    }
  }
  console.log(`  Updated: website=${ww} phone=${wp} email=${we} naac=${wa}`)

  // --- Process: Webcopy fees ---
  const feeUpdates: { id: string; fees: number }[] = []
  const feesByUrl = new Map<string, number>()
  for (const f of webcopyFees) {
    const val = parseFee(f.fee_amount)
    if (!val) continue
    const existing = feesByUrl.get(f.college_url)
    if (!existing || val < existing) feesByUrl.set(f.college_url, val)
  }
  for (const [url, amt] of feesByUrl) {
    const col = webcopyMatches.get(url)
    if (col && !col.fees) feeUpdates.push({ id: col.id, fees: amt })
  }
  for (let i = 0; i < feeUpdates.length; i += 50) {
    await Promise.all(feeUpdates.slice(i, i + 50).map(u => prisma.college.update({ where: { id: u.id }, data: { fees: u.fees } }).catch(() => {})))
  }
  console.log(`  Fees: ${feeUpdates.length}`)

  // --- Process: Webcopy placements ---
  let plc = 0
  const existingPlacements = await prisma.placement.findMany({ where: { year: 2024 }, select: { collegeId: true } })
  const existingSet = new Set(existingPlacements.map(p => p.collegeId))
  for (const p of webcopyPlacements) {
    const col = webcopyMatches.get(p.college_url)
    if (!col || existingSet.has(col.id)) continue
    const avg = parseLPA(p.average_package)
    const high = parseLPA(p.highest_package)
    const rate = parseFloat(p.placement_rate) || 0
    if (avg || high) {
      const recruiters = webcopyRecruiters.filter(r => r.college_url === p.college_url).map(r => r.name)
      await prisma.placement.create({
        data: { collegeId: col.id, year: 2024, averagePackage: avg || high, highestPackage: high || avg, placementRate: rate, topRecruiters: recruiters },
      }).catch(() => {})
      plc++
    }
  }
  console.log(`  Placements: ${plc}`)

  // --- Process: API cache (bulk fees + rating + placement_pct) ---
  console.log("\n--- Source 1: API Cache Bulk Enrichment ---")
  let af = 0, ar = 0, ap = 0
  if (apiResults) {
    // Match by name+city like the matcher does
    let batch: { id: string; fees?: number }[] = []
    for (const r of apiResults) {
      const key = r.name.toLowerCase().slice(0, 25) + "|" + r.city.toLowerCase().slice(0, 15)
      const col = byNameCity.get(key)
      if (!col) continue

      // Fees
      if (r.fees && r.fees > 0 && !col.fees) {
        batch.push({ id: col.id, fees: r.fees })
        af++
      }
      if (batch.length >= 50) {
        await Promise.all(batch.map(u => prisma.college.update({ where: { id: u.id }, data: { fees: u.fees } }).catch(() => {})))
        batch = []
      }

      // Placement rate from API (placement_percentage)
      if (r.placementRate && r.placementRate > 0 && !existingSet.has(col.id)) {
        await prisma.placement.create({
          data: { collegeId: col.id, year: 2024, averagePackage: r.placementAvg || 0, highestPackage: r.placementHigh || 0, placementRate: r.placementRate, topRecruiters: [] },
        }).catch(() => {})
        existingSet.add(col.id)
        ap++
      }
    }
    if (batch.length > 0) {
      await Promise.all(batch.map(u => prisma.college.update({ where: { id: u.id }, data: { fees: u.fees } }).catch(() => {})))
    }
  }
  console.log(`  Fees: ${af}, Ratings: ${ar}, Placements: ${ap}`)

  // Final stats
  const after = {
    fees: await prisma.college.count({ where: { fees: { gt: 0 } } }),
    website: await prisma.college.count({ where: { website: { not: null } } }),
    phone: await prisma.college.count({ where: { phone: { not: null } } }),
    email: await prisma.college.count({ where: { email: { not: null } } }),
    accred: await prisma.college.count({ where: { accreditation: { not: null } } }),
    placements: await prisma.placement.groupBy({ by: ["collegeId"] }).then(r => r.length),
  }

  console.log("\n=== Results ===")
  console.log(`  Fees: ${before.fees} -> ${after.fees} (+${after.fees - before.fees})`)
  console.log(`  Website: ${before.website} -> ${after.website} (+${after.website - before.website})`)
  console.log(`  Phone: ${before.phone} -> ${after.phone} (+${after.phone - before.phone})`)
  console.log(`  Email: ${before.email} -> ${after.email} (+${after.email - before.email})`)
  console.log(`  NAAC/Accred: ${before.accred} -> ${after.accred} (+${after.accred - before.accred})`)
  console.log(`  Placements: ${before.placements} -> ${after.placements} (+${after.placements - before.placements})`)

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
