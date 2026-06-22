import type {
  College,
  Course,
  Placement,
  Review,
  User,
  CutoffRank,
  CollegeType,
  ExamType,
  Category
} from "@prisma/client"

export type { CollegeType, ExamType, Category }

export type CollegeWithRelations = College & {
  courses: Course[]
  placements: Placement[]
  reviews: (Review & {
    user: Pick<User, "id" | "name" | "image">
  })[]
  cutoffRanks: CutoffRank[]
  _count?: {
    savedBy: number
    reviews: number
  }
}

export type CollegeCard = Pick<
  College,
  | "id"
  | "name"
  | "slug"
  | "city"
  | "state"
  | "fees"
  | "rating"
  | "reviewCount"
  | "imageUrl"
  | "type"
  | "accreditation"
  | "established"
  | "nirfRank"
> & {
  latestPlacement?: Pick<
    Placement,
    "averagePackage" | "highestPackage" | "placementRate" | "year"
  > | null
}

export type CollegeDetail = College & {
  courses: Course[]
  placements: Placement[]
  reviews: (Review & {
    user: Pick<User, "id" | "name" | "image">
  })[]
  cutoffRanks: CutoffRank[]
  _count: {
    savedBy: number
    reviews: number
  }
}

export type ApiResponse<T> = {
  data: T
  message?: string
}

export type ApiError = {
  error: string
  details?: unknown
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export type CollegeFilters = {
  search?: string
  state?: string
  type?: string
  exam?: string
  minFees?: number
  maxFees?: number
  minRating?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
  instituteType?: string // 'IIT' | 'NIT' | 'ALL'
}

export type PredictorInput = {
  exam: ExamType
  rank: number
  category: Category
  year: number
  quota?: string | null
  gender?: string | null
}

export type PredictorResult = {
  cutoffId: string
  college: CollegeCard
  cutoff: Pick<CutoffRank, "minRank" | "maxRank" | "course" | "exam" | "year" | "category"> & {
    quota?: string | null
    gender?: string | null
  }
  chanceLevel: "SAFE" | "MODERATE" | "REACH"
  chancePercentage: number
}

export type PredictorResponse = {
  input: PredictorInput
  results: {
    safe: PredictorResult[]
    moderate: PredictorResult[]
    reach: PredictorResult[]
  }
  totalFound: number
}

export type CompareData = {
  colleges: CollegeDetail[]
}

export type SavedCollegeWithCollege = {
  id: string
  collegeId: string
  createdAt: Date
  college: CollegeCard
}

export type SavedComparisonWithColleges = {
  id: string
  createdAt: Date
  collegeA: CollegeCard
  collegeB: CollegeCard
  collegeC: CollegeCard | null
}

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">
}

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}
