import type { RawCollege, RawCourse, RawPlacement, RawCutoff, DedupKey, ETLResult } from "./types"
import { makeDedupKey } from "./types"

export interface NormalizedCollege {
  dedupKey: DedupKey
  name: string
  slug: string
  location: string
  city: string
  state: string
  country: string
  fees: number
  overview: string
  established: number | null
  type: "GOVERNMENT" | "PRIVATE" | "DEEMED" | "AUTONOMOUS"
  status: "ACTIVE" | "SUSPENDED" | "CLOSED"
  accreditation: string | null
  website: string | null
  email: string | null
  phone: string | null
  examAccepted: string[]
  nirfRank: number | null
  sources: string[]
  sourceIds: string[]
}

export interface NormalizedCourse {
  collegeKey: DedupKey
  name: string
  duration: string
  fees: number
  seats: number | null
  degree: string
}

export interface NormalizedPlacement {
  collegeKey: DedupKey
  year: number
  averagePackage: number
  highestPackage: number
  placementRate: number
  topRecruiters: string[]
}

export interface NormalizedCutoff {
  collegeKey: DedupKey
  exam: string
  year: number
  category: string
  minRank: number
  maxRank: number
  course: string | null
}

export interface NormalizedData {
  colleges: NormalizedCollege[]
  courses: NormalizedCourse[]
  placements: NormalizedPlacement[]
  cutoffs: NormalizedCutoff[]
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

function ensureUniqueSlugs(colleges: NormalizedCollege[]): NormalizedCollege[] {
  const slugCounts = new Map<string, number>()
  return colleges.map((c) => {
    let slug = toSlug(c.name)
    const count = slugCounts.get(slug) || 0
    if (count > 0) slug = `${slug}-${count}`
    slugCounts.set(toSlug(c.name), count + 1)
    return { ...c, slug }
  })
}

export function normalize(result: ETLResult): NormalizedData {
  // Merge colleges by dedup key (name + city), preferring higher-quality sources
  const collegeMap = new Map<DedupKey, NormalizedCollege>()
  const sourcePriority = { INLINE: 0, NIRF: 1, AICTE: 2, UGC: 3, AISHE: 4 }

  for (const raw of result.colleges) {
    const key = makeDedupKey(raw.name, raw.city)
    const existing = collegeMap.get(key)
    const priority = sourcePriority[raw.source as keyof typeof sourcePriority] ?? 99

    if (existing) {
      // Higher-priority source overwrites type
      const existingPriority = sourcePriority[existing.sources[0] as keyof typeof sourcePriority] ?? 99
      if (priority < existingPriority) {
        if (raw.type !== "GOVERNMENT" || existing.type === "GOVERNMENT") {
          existing.type = raw.type
        }
      }
      // Merge data — prefer non-zero fees, existing overview, non-null fields
      if (!existing.fees && raw.fees) existing.fees = raw.fees
      if (!existing.established && raw.established) existing.established = raw.established
      if (!existing.website && raw.website) existing.website = raw.website
      if (!existing.email && raw.email) existing.email = raw.email
      if (!existing.phone && raw.phone) existing.phone = raw.phone
      if (!existing.nirfRank && raw.nirfRank) existing.nirfRank = raw.nirfRank ?? null
      if (!existing.overview || existing.overview.startsWith("AICTE-approved"))
        existing.overview = raw.overview
      if (raw.overview && !existing.overview.startsWith(raw.overview.slice(0, 20)))
        existing.overview = raw.overview || existing.overview
      if (raw.status === "SUSPENDED" || raw.status === "CLOSED") existing.status = raw.status
      existing.examAccepted = Array.from(new Set([...existing.examAccepted, ...raw.examAccepted]))
      if (!existing.sources.includes(raw.source)) existing.sources.push(raw.source)
      if (!existing.sourceIds.includes(raw.sourceId)) existing.sourceIds.push(raw.sourceId)
    } else {
      collegeMap.set(key, {
        dedupKey: key,
        name: raw.name,
        slug: "",
        location: raw.location,
        city: raw.city,
        state: raw.state,
        country: raw.country,
        fees: raw.fees,
        overview: raw.overview,
        established: raw.established,
        type: raw.type,
        status: raw.status || "ACTIVE",
        accreditation: raw.accreditation,
        website: raw.website,
        email: raw.email,
        phone: raw.phone,
        examAccepted: [...raw.examAccepted],
        nirfRank: raw.nirfRank ?? null,
        sources: [raw.source],
        sourceIds: [raw.sourceId],
      })
    }
  }

  const colleges = ensureUniqueSlugs(Array.from(collegeMap.values()))

  // Build lookup map
  const lookup = new Map<DedupKey, string>()
  for (const c of colleges) {
    lookup.set(c.dedupKey, c.slug)
  }

  // Normalize courses
  const courses: NormalizedCourse[] = result.courses
    .filter((rc) => lookup.has(makeDedupKey(rc.collegeName, rc.collegeCity)))
    .map((rc) => ({
      collegeKey: makeDedupKey(rc.collegeName, rc.collegeCity),
      name: rc.name,
      duration: rc.duration,
      fees: rc.fees,
      seats: rc.seats,
      degree: rc.degree,
    }))

  // Normalize placements
  const placements: NormalizedPlacement[] = result.placements
    .filter((rp) => lookup.has(makeDedupKey(rp.collegeName, rp.collegeCity)))
    .map((rp) => ({
      collegeKey: makeDedupKey(rp.collegeName, rp.collegeCity),
      year: rp.year,
      averagePackage: rp.averagePackage,
      highestPackage: rp.highestPackage,
      placementRate: rp.placementRate,
      topRecruiters: rp.topRecruiters,
    }))

  // Normalize cutoffs
  const cutoffs: NormalizedCutoff[] = result.cutoffs
    .filter((rc) => lookup.has(makeDedupKey(rc.collegeName, rc.collegeCity)))
    .map((rc) => ({
      collegeKey: makeDedupKey(rc.collegeName, rc.collegeCity),
      exam: rc.exam,
      year: rc.year,
      category: rc.category,
      minRank: rc.minRank,
      maxRank: rc.maxRank,
      course: rc.course,
    }))

  return { colleges, courses, placements, cutoffs }
}
