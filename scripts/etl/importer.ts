import { PrismaClient, CollegeType, CollegeStatus, ExamType, Category } from "@prisma/client"
import type { NormalizedCollege, NormalizedCourse, NormalizedPlacement, NormalizedCutoff } from "./normalizer"
import type { ImportSummary, DedupKey } from "./types"

export class DBImporter {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async import(
    normalizedColleges: NormalizedCollege[],
    courses: NormalizedCourse[],
    placements: NormalizedPlacement[],
    cutoffs: NormalizedCutoff[],
    dryRun = false
  ): Promise<ImportSummary> {
    const summary: ImportSummary = {
      collegesCreated: 0, collegesUpdated: 0, collegesSkipped: 0,
      coursesCreated: 0, placementsCreated: 0, cutoffsCreated: 0, errors: [],
    }

    if (dryRun) {
      console.log(`\n[Dry Run] Would import:`)
      console.log(`  Colleges:  ${normalizedColleges.length}`)
      console.log(`  Courses:   ${courses.length}`)
      console.log(`  Placements:${placements.length}`)
      console.log(`  Cutoffs:   ${cutoffs.length}`)
      return summary
    }

    console.log(`\n[Import] Starting batch import of ${normalizedColleges.length} colleges...`)

    // Pre-load all existing colleges into a lookup map
    const allExisting = await this.prisma.college.findMany({ select: { id: true, slug: true, name: true, city: true, website: true, email: true, phone: true, established: true, overview: true } })
    const slugMap = new Map<string, typeof allExisting[0]>()
    const nameCityMap = new Map<string, typeof allExisting[0]>()
    for (const col of allExisting) {
      slugMap.set(col.slug, col)
      nameCityMap.set(`${col.name}|${col.city}`.toLowerCase(), col)
    }

    // slug -> DB id
    const slugToId = new Map<string, string>()
    for (const col of allExisting) slugToId.set(col.slug, col.id)

    const toCreate: typeof normalizedColleges = []
    const toUpdate: Array<{ id: string; data: any }> = []

    for (let i = 0; i < normalizedColleges.length; i++) {
      const c = normalizedColleges[i]
      const data = {
        name: c.name, slug: c.slug, location: c.location, city: c.city, state: c.state,
        country: c.country, fees: c.fees, rating: 0, reviewCount: 0,
        overview: c.overview, established: c.established, type: c.type as CollegeType,
        status: c.status as CollegeStatus,
        accreditation: c.accreditation, website: c.website, email: c.email, phone: c.phone,
        examAccepted: c.examAccepted as ExamType[],
      }

      const existing = slugMap.get(c.slug) || nameCityMap.get(`${c.name}|${c.city}`.toLowerCase())

      if (existing) {
        slugToId.set(c.slug, existing.id)
        const needsUpdate =
          (!existing.website && c.website) ||
          (!existing.email && c.email) ||
          (!existing.phone && c.phone) ||
          (!existing.established && c.established) ||
          (!existing.overview || existing.overview.length < 20)
        if (needsUpdate) {
          toUpdate.push({ id: existing.id, data })
        } else {
          summary.collegesSkipped++
        }
      } else {
        toCreate.push(c)
      }

      if ((i + 1) % 1000 === 0) {
        console.log(`[Import] Processed ${i + 1}/${normalizedColleges.length} colleges`)
      }
    }

    // Batch update existing colleges
    if (toUpdate.length > 0) {
      for (const { id, data } of toUpdate) {
        await this.prisma.college.update({ where: { id }, data })
      }
      summary.collegesUpdated = toUpdate.length
      console.log(`[Import] Updated ${toUpdate.length} existing colleges`)
    } else {
      console.log(`[Import] No existing colleges needed updates`)
    }

    // Batch create new colleges
    if (toCreate.length > 0) {
      const BATCH_SIZE = 5000
      for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
        const batch = toCreate.slice(i, i + BATCH_SIZE).map((c) => ({
          name: c.name, slug: c.slug, location: c.location, city: c.city, state: c.state,
          country: c.country, fees: c.fees, rating: 0, reviewCount: 0,
          overview: c.overview, established: c.established, type: c.type as CollegeType,
          status: c.status as CollegeStatus,
          accreditation: c.accreditation, website: c.website, email: c.email, phone: c.phone,
          examAccepted: c.examAccepted as ExamType[],
        }))
        await this.prisma.college.createMany({ data: batch, skipDuplicates: true })
        console.log(`[Import] Created batch ${Math.min(i + BATCH_SIZE, toCreate.length)}/${toCreate.length} colleges`)
      }

      // Re-fetch new colleges to get their IDs
      const createdSlugs = toCreate.map((c) => c.slug)
      const newColleges = await this.prisma.college.findMany({
        where: { slug: { in: createdSlugs } },
        select: { id: true, slug: true },
      })
      for (const nc of newColleges) slugToId.set(nc.slug, nc.id)

      summary.collegesCreated = newColleges.length
    } else {
      console.log(`[Import] No new colleges to create`)
    }

    // Build dedupKey -> id map
    const dedupToId = new Map<DedupKey, string>()
    for (const c of normalizedColleges) {
      const id = slugToId.get(c.slug)
      if (id) dedupToId.set(c.dedupKey, id)
    }

    // Courses
    if (courses.length > 0) {
      console.log(`[Import] Importing ${courses.length} courses...`)
      const courseData = courses
        .map((co) => {
          const collegeId = dedupToId.get(co.collegeKey)
          if (!collegeId) { summary.errors.push(`Course "${co.name}" — no matching college`); return null }
          return { collegeId, name: co.name, duration: co.duration, fees: co.fees, seats: co.seats, degree: co.degree }
        })
        .filter(Boolean)
      if (courseData.length > 0) {
        for (let i = 0; i < courseData.length; i += 1000) {
          const batch = courseData.slice(i, i + 1000)
          await this.prisma.course.createMany({ data: batch as any, skipDuplicates: true })
        }
        summary.coursesCreated = courseData.length
      }
    } else {
      console.log(`[Import] No courses to import`)
    }

    // Placements
    if (placements.length > 0) {
      console.log(`[Import] Importing ${placements.length} placements...`)
      const placementData = placements
        .map((pl) => {
          const collegeId = dedupToId.get(pl.collegeKey)
          if (!collegeId) { summary.errors.push(`Placement for year ${pl.year} — no matching college`); return null }
          return { collegeId, year: pl.year, averagePackage: pl.averagePackage, highestPackage: pl.highestPackage, placementRate: pl.placementRate, topRecruiters: pl.topRecruiters }
        })
        .filter(Boolean)
      if (placementData.length > 0) {
        for (let i = 0; i < placementData.length; i += 1000) {
          const batch = placementData.slice(i, i + 1000)
          await this.prisma.placement.createMany({ data: batch as any, skipDuplicates: true })
        }
        summary.placementsCreated = placementData.length
      }
    } else {
      console.log(`[Import] No placements to import`)
    }

    // Cutoffs
    if (cutoffs.length > 0) {
      console.log(`[Import] Importing ${cutoffs.length} cutoffs...`)
      const cutoffData = cutoffs
        .map((cu) => {
          const collegeId = dedupToId.get(cu.collegeKey)
          if (!collegeId) { summary.errors.push(`Cutoff for ${cu.exam} ${cu.year} — no matching college`); return null }
          return { collegeId, exam: cu.exam as ExamType, year: cu.year, category: cu.category as Category, minRank: cu.minRank, maxRank: cu.maxRank, course: cu.course }
        })
        .filter(Boolean)
      if (cutoffData.length > 0) {
        for (let i = 0; i < cutoffData.length; i += 1000) {
          const batch = cutoffData.slice(i, i + 1000)
          await this.prisma.cutoffRank.createMany({ data: batch as any, skipDuplicates: true })
        }
        summary.cutoffsCreated = cutoffData.length
      }
    } else {
      console.log(`[Import] No cutoffs to import`)
    }

    console.log(`[Import] Complete!`)
    return summary
  }
}
