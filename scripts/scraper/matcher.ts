import { PrismaClient } from "@prisma/client"
import { ScrapedCollege } from "./types"

interface MatchResult {
  collegeId: string
  confidence: number
  scraped: ScrapedCollege
}

export async function matchAndEnrich(prisma: PrismaClient, scraped: ScrapedCollege[]): Promise<{ matched: number; enriched: Record<string, string[]> }> {
  const enriched: Record<string, string[]> = { fees: [], placements: [], contacts: [], overviews: [] }
  let matched = 0

  for (const s of scraped) {
    if (!s.name) continue

    // Normalize scraped name for matching
    const nameNorm = s.name.toLowerCase().replace(/\s+/g, " ").trim()
    const cityNorm = s.city.toLowerCase().replace(/\s+/g, " ").trim()

    // Try exact match first
    let college = await prisma.college.findFirst({
      where: {
        name: { contains: nameNorm.substring(0, 30), mode: "insensitive" },
        city: cityNorm ? { contains: cityNorm.substring(0, 20), mode: "insensitive" } : undefined,
      },
      select: { id: true, name: true, city: true, fees: true, website: true, email: true, phone: true },
    })

    if (!college) {
      // Try fuzzy: first 20 chars of name
      const first20 = nameNorm.substring(0, 20)
      const candidates = await prisma.college.findMany({
        where: {
          name: { contains: first20, mode: "insensitive" },
          city: cityNorm ? { contains: cityNorm.substring(0, 15), mode: "insensitive" } : undefined,
        },
        select: { id: true, name: true, city: true, fees: true, website: true, email: true, phone: true },
        take: 5,
      })
      if (candidates.length === 1) {
        college = candidates[0]
      } else if (candidates.length > 1) {
        // Pick the one with highest name similarity
        let bestScore = 0
        for (const c of candidates) {
          const cn = c.name.toLowerCase().replace(/\s+/g, " ").trim()
          const score = similarity(nameNorm, cn)
          if (score > bestScore && score > 0.6) {
            bestScore = score
            college = c
          }
        }
      }
    }

    if (!college) continue
    matched++

    // Enrich
    const updates: any = {}

    // Fees
    if (s.fees && s.fees > 0 && !college.fees) {
      updates.fees = s.fees
      enriched.fees.push(college.id)
    }

    // Website
    if (s.website && !college.website) {
      updates.website = s.website
      enriched.contacts.push(college.id)
    }

    // Email
    if (s.email && !college.email) {
      updates.email = s.email
      enriched.contacts.push(college.id)
    }

    // Phone
    if (s.phone && !college.phone) {
      updates.phone = s.phone
      enriched.contacts.push(college.id)
    }

    if (Object.keys(updates).length > 0) {
      await prisma.college.update({ where: { id: college.id }, data: updates })
    }

    // Placement data
    if (s.placementAvg || s.placementHigh) {
      const existing = await prisma.placement.findFirst({
        where: { collegeId: college.id, year: 2024 },
      })
      if (!existing) {
        await prisma.placement.create({
          data: {
            collegeId: college.id,
            year: 2024,
            averagePackage: s.placementAvg || 0,
            highestPackage: s.placementHigh || s.placementAvg || 0,
            placementRate: s.placementRate || 0,
            topRecruiters: s.topRecruiters || [],
          },
        }).catch(() => {})
        enriched.placements.push(college.id)
      }
    }
  }

  return { matched, enriched }
}

function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 3 || b.length < 3) return 0
  // Dice coefficient on bigrams
  const bigramsA = new Set<string>()
  for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.substring(i, i + 2))
  const bigramsB = new Set<string>()
  for (let i = 0; i < b.length - 1; i++) bigramsB.add(b.substring(i, i + 2))
  let intersection = 0
  Array.from(bigramsA).forEach((bg) => {
    if (bigramsB.has(bg)) intersection++
  })
  return (2 * intersection) / (bigramsA.size + bigramsB.size)
}
