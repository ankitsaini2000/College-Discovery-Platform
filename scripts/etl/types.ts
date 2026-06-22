import type { CollegeType, ExamType, Category } from "@prisma/client"

export type RawCollegeSource = "AICTE" | "UGC" | "NIRF" | "INLINE" | "AISHE"

export interface RawCollege {
  name: string
  location: string
  city: string
  state: string
  country: string
  fees: number
  overview: string
  established: number | null
  type: CollegeType
  status?: "ACTIVE" | "SUSPENDED" | "CLOSED"
  accreditation: string | null
  website: string | null
  email: string | null
  phone: string | null
  examAccepted: ExamType[]
  source: RawCollegeSource
  sourceId: string
  nirfRank?: number | null
}

export interface RawCourse {
  collegeName: string
  collegeCity: string
  name: string
  duration: string
  fees: number
  seats: number | null
  degree: string
}

export interface RawPlacement {
  collegeName: string
  collegeCity: string
  year: number
  averagePackage: number
  highestPackage: number
  placementRate: number
  topRecruiters: string[]
}

export interface RawCutoff {
  collegeName: string
  collegeCity: string
  exam: ExamType
  year: number
  category: Category
  minRank: number
  maxRank: number
  course: string | null
}

export interface NIRFEntry {
  rank: number
  name: string
  city: string
  state: string
  score: number
}

export interface ETLResult {
  colleges: RawCollege[]
  courses: RawCourse[]
  placements: RawPlacement[]
  cutoffs: RawCutoff[]
}

export interface ImportSummary {
  collegesCreated: number
  collegesUpdated: number
  collegesSkipped: number
  coursesCreated: number
  placementsCreated: number
  cutoffsCreated: number
  errors: string[]
}

export interface ETLSource {
  name: string
  fetch: () => Promise<ETLResult>
}

export type DedupKey = string

export function makeDedupKey(name: string, city: string): DedupKey {
  return `${name.toLowerCase().replace(/\s+/g, " ").trim()}|${city.toLowerCase().trim()}`
}
