export interface ScrapedCollege {
  name: string
  city: string
  state: string
  website: string | null
  email: string | null
  phone: string | null
  fees: number | null
  established: number | null
  type: string | null
  accreditation: string | null
  overview: string | null
  placementAvg: number | null
  placementHigh: number | null
  placementRate: number | null
  topRecruiters: string[]
  nirfRank: number | null
  source: "COLLEGEDUNIA" | "SHIKSHA"
  sourceUrl: string
}

export interface ScraperResult {
  colleges: ScrapedCollege[]
  errors: string[]
}

export interface ScraperSource {
  name: string
  fetch: (progress: ProgressCallback) => Promise<ScraperResult>
}

export type ProgressCallback = (current: number, total: number, message: string) => void

export interface ScraperConfig {
  maxConcurrency: number
  maxRetries: number
  requestDelayMs: number
  outputDir: string
  resume: boolean
}

export const DEFAULT_CONFIG: ScraperConfig = {
  maxConcurrency: 3,
  maxRetries: 3,
  requestDelayMs: 2000,
  outputDir: "scripts/scraper/data",
  resume: true,
}
