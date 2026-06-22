import { PrismaClient } from "@prisma/client"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()
const DATA = join(__dirname, "..", "data")

interface CollegeRec {
  college_name: string
  college_url: string
  city: string
  established_year: string
  ownership_type: string
  naac_grade: string
  website: string
  phone: string
  email: string
  address: string
}

interface FeeRec {
  college_url: string
  course_name: string
  year: string
  fee_amount: string
}

interface CourseRec {
  college_url: string
  course_name: string
  fees: string
  duration: string
  exam_accepted: string
  cutoff: string
}

interface PlacementRec {
  college_url: string
  average_package: string
  highest_package: string
  placement_rate: string
  year: string
}

interface RecruiterRec {
  college_url: string
  name: string
}

interface ReviewRec {
  college_url: string
  rating: string
  review_count: string
}

function parseFee(amount: string): number {
  const s = amount.replace(/,/g, "").trim().toLowerCase()
  // "INR 1.77 L" -> 177000
  const lpaMatch = s.match(/(\d+\.?\d*)\s*l/i)
  if (lpaMatch) return Math.round(parseFloat(lpaMatch[1]) * 100000)
  // "INR 96,845" -> 96845
  const numMatch = s.match(/(\d+)/)
  if (numMatch) return parseInt(numMatch[1])
  return 0
}

function parseLPA(val: string): number {
  if (!val) return 0
  const s = val.trim().toLowerCase()
  // "9 LPA" -> 900000
  const lpaMatch = s.match(/(\d+\.?\d*)\s*lpa/)
  if (lpaMatch) return Math.round(parseFloat(lpaMatch[1]) * 100000)
  // "5 k" -> 5000 (some entries have nonsense values like "5 k" or "26 k")
  const kMatch = s.match(/(\d+\.?\d*)\s*k/)
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000)
  const numMatch = s.match(/(\d+)/)
  if (numMatch) return parseInt(numMatch[1])
  return 0
}

function extractCollegeId(url: string): string | null {
  const m = url.match(/\/college\/(\d+)/)
  return m ? m[1] : null
}

async function main() {
  console.log("=== Webcopy Data Enrichment ===\n")

  // Load data
  const colleges: CollegeRec[] = JSON.parse(readFileSync(join(DATA, "colleges.json"), "utf-8"))
  const fees: FeeRec[] = JSON.parse(readFileSync(join(DATA, "fees.json"), "utf-8"))
  const placements: PlacementRec[] = JSON.parse(readFileSync(join(DATA, "placements.json"), "utf-8"))
  const recruiters: RecruiterRec[] = JSON.parse(readFileSync(join(DATA, "recruiters.json"), "utf-8"))

  // Build URL -> data maps
  const collegeMap = new Map(colleges.map(c => [c.college_url, c]))
  const feesByUrl = new Map<string, FeeRec[]>()
  for (const f of fees) {
    if (!feesByUrl.has(f.college_url)) feesByUrl.set(f.college_url, [])
    feesByUrl.get(f.college_url)!.push(f)
  }
  const placementByUrl = new Map(placements.map(p => [p.college_url, p]))
  const recruitersByUrl = new Map<string, RecruiterRec[]>()
  for (const r of recruiters) {
    if (!recruitersByUrl.has(r.college_url)) recruitersByUrl.set(r.college_url, [])
    recruitersByUrl.get(r.college_url)!.push(r)
  }

  // Match by URL -> college ID
  const urlToSlug = new Map<string, string>()
  for (const url of collegeMap.keys()) {
    const cdId = extractCollegeId(url)
    if (!cdId) continue
    // Try matching by CD numeric ID embedded in slug or name
    const slugSuffix = `-${cdId}`
    const bySlug = await prisma.college.findFirst({
      where: { slug: { contains: slugSuffix } },
      select: { slug: true },
    })
    if (bySlug) { urlToSlug.set(url, bySlug.slug); continue }

    // Match by name substring (first 25 chars)
    const rec = collegeMap.get(url)!
    const nameClean = rec.college_name.replace(/:.*$/, "").trim()
    const byName = await prisma.college.findFirst({
      where: {
        name: { contains: nameClean.substring(0, 25), mode: "insensitive" },
        city: rec.city ? { contains: rec.city.substring(0, 15), mode: "insensitive" } : undefined,
      },
      select: { slug: true },
    })
    if (byName) { urlToSlug.set(url, byName.slug) }
  }

  // Enrich
  let matched = 0, webUpdated = 0, phoneUpdated = 0, emailUpdated = 0
  let naacUpdated = 0, estUpdated = 0, feeUpdated = 0, placementCreated = 0

  for (const [url, rec] of collegeMap) {
    const slug = urlToSlug.get(url)
    if (!slug) continue
    matched++

    const college = await prisma.college.findUnique({ where: { slug }, select: { id: true, fees: true, website: true, email: true, phone: true } })
    if (!college) continue

    const updates: any = {}
    if (rec.website && !college.website) { updates.website = rec.website.startsWith("http") ? rec.website : "https://" + rec.website; webUpdated++ }
    if (rec.email && !college.email) { updates.email = rec.email; emailUpdated++ }
    if (rec.phone && !college.phone) { updates.phone = rec.phone; phoneUpdated++ }

    if (Object.keys(updates).length) await prisma.college.update({ where: { id: college.id }, data: updates })

    // NAAC grade (store in accreditation field)
    if (rec.naac_grade) {
      await prisma.college.update({ where: { id: college.id }, data: { accreditation: rec.naac_grade } }).catch(() => {})
      naacUpdated++
    }

    // Fees (lowest fee across courses)
    const courseFees = feesByUrl.get(url)
    if (courseFees && courseFees.length > 0) {
      const minFee = Math.min(...courseFees.map(f => parseFee(f.fee_amount)).filter(Boolean))
      if (minFee > 0 && !college.fees) {
        await prisma.college.update({ where: { id: college.id }, data: { fees: minFee } }).catch(() => {})
        feeUpdated++
      }
    }

    // Placement
    const pl = placementByUrl.get(url)
    if (pl) {
      const avg = parseLPA(pl.average_package)
      const high = parseLPA(pl.highest_package)
      const rate = parseFloat(pl.placement_rate) || 0
      if (avg || high) {
        const existing = await prisma.placement.findFirst({ where: { collegeId: college.id, year: 2024 } })
        if (!existing) {
          await prisma.placement.create({
            data: {
              collegeId: college.id, year: 2024,
              averagePackage: avg || high || 0,
              highestPackage: high || avg || 0,
              placementRate: rate,
              topRecruiters: (recruitersByUrl.get(url) || []).map(r => r.name),
            },
          }).catch(() => {})
          placementCreated++
        }
      }
    }
  }

  console.log(`Total webcopy records: ${colleges.length}`)
  console.log(`Matched to DB: ${matched}`)
  console.log(`\nEnrichment results:`)
  console.log(`  Website: ${webUpdated}`)
  console.log(`  Phone: ${phoneUpdated}`)
  console.log(`  Email: ${emailUpdated}`)
  console.log(`  NAAC Grade: ${naacUpdated}`)
  console.log(`  Fees: ${feeUpdated}`)
  console.log(`  Placements: ${placementCreated}`)

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
