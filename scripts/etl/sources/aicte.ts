import type { ETLSource, ETLResult, RawCollege, NIRFEntry } from "../types"

/**
 * AICTE Source — fetches approved institutions from data.gov.in API.
 *
 * The API provides a list of AICTE-approved technical institutions across India.
 * Data is paginated; we fetch all pages and merge.
 *
 * API: https://api.data.gov.in/resource/<resource-id>
 * Resource: AICTE Approved Institutions (resource ID can change; configurable via env)
 *
 * Rate limit: 1 request/second recommended.
 */

const AICTE_API_BASE = process.env.AICTE_API_URL || "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
const API_KEY = process.env.DATA_GOV_IN_API_KEY || ""

interface AICTERecord {
  institute_name?: string
  institute_type?: string
  state?: string
  city?: string
  address?: string
  pincode?: string
  affliated_university?: string
  year_of_establishment?: string
  website?: string
  email?: string
  phone?: string
  [key: string]: unknown
}

export class AICTESource implements ETLSource {
  name = "AICTE (data.gov.in)"

  async fetch(): Promise<ETLResult> {
    if (!API_KEY) {
      console.warn("[AICTE] No DATA_GOV_IN_API_KEY set. Skipping live fetch. Set the env var to enable.")
      return { colleges: [], courses: [], placements: [], cutoffs: [] }
    }

    console.log("[AICTE] Fetching approved institutions from data.gov.in...")
    const allRecords: AICTERecord[] = []
    const limit = 1000
    let offset = 0
    let total = 0

    try {
      do {
        const url = `${AICTE_API_BASE}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`AICTE API responded with ${res.status}: ${res.statusText}`)
        }
        const body = await res.json()
        const records: AICTERecord[] = body.records || []
        total = body.total || records.length
        allRecords.push(...records)
        console.log(`[AICTE] Fetched ${records.length} records (offset ${offset})`)
        offset += limit
        if (records.length > 0) await new Promise((r) => setTimeout(r, 1100)) // rate limit
      } while (offset < total)

      console.log(`[AICTE] Total fetched: ${allRecords.length}`)

      const colleges = this.transform(allRecords)
      return { colleges, courses: [], placements: [], cutoffs: [] }
    } catch (err) {
      console.error(`[AICTE] Fetch failed:`, err instanceof Error ? err.message : err)
      return { colleges: [], courses: [], placements: [], cutoffs: [] }
    }
  }

  private transform(records: AICTERecord[]): RawCollege[] {
    const typeMap: Record<string, "GOVERNMENT" | "PRIVATE" | "DEEMED" | "AUTONOMOUS"> = {
      "Government": "GOVERNMENT",
      "Government Aided": "GOVERNMENT",
      "Private": "PRIVATE",
      "Private Unaided": "PRIVATE",
      "Deemed University": "DEEMED",
      "Autonomous": "AUTONOMOUS",
    }

    return records
      .filter((r) => r.institute_name && r.state && r.city)
      .map((r, i): RawCollege => {
        const instType = (r.institute_type || "Private").trim()
        const type = typeMap[instType] || "PRIVATE"
        const established = r.year_of_establishment ? parseInt(r.year_of_establishment, 10) : null

        return {
          name: r.institute_name!.trim(),
          location: [r.address, r.city, r.state].filter(Boolean).join(", "),
          city: r.city!.trim(),
          state: r.state!.trim(),
          country: "India",
          fees: 0,
          overview: `${r.institute_name} is an AICTE-approved ${type.toLowerCase()} institution in ${r.city}, ${r.state}.`,
          established: established && !isNaN(established) ? established : null,
          type,
          accreditation: null,
          website: r.website?.trim() || null,
          email: r.email?.trim() || null,
          phone: r.phone?.trim() || null,
          examAccepted: [],
          source: "AICTE",
          sourceId: `aicte-${i}-${r.institute_name?.replace(/\s+/g, "-").slice(0, 30)}`,
          nirfRank: null,
        }
      })
  }
}

/**
 * NIRF Source — scrapes the NIRF rankings from nirfindia.org
 */
export class NIRFSource implements ETLSource {
  name = "NIRF (nirfindia.org)"

  async fetch(): Promise<ETLResult> {
    console.log("[NIRF] Fetching NIRF engineering rankings...")
    try {
      const entries = await this.scrapeEngineering()
      console.log(`[NIRF] Fetched ${entries.length} ranked institutions`)

      const colleges: RawCollege[] = entries.map((e): RawCollege => ({
        name: e.name,
        city: e.city,
        state: e.state,
        location: `${e.city}, ${e.state}`,
        country: "India",
        fees: 0,
        overview: `${e.name} is ranked #${e.rank} in NIRF Engineering rankings with a score of ${e.score}.`,
        established: null,
        type: "GOVERNMENT",
        accreditation: null,
        website: null,
        email: null,
        phone: null,
        examAccepted: [],
        source: "NIRF",
        sourceId: `nirf-eng-${e.rank}`,
        nirfRank: e.rank,
      }))

      return { colleges, courses: [], placements: [], cutoffs: [] }
    } catch (err) {
      console.error(`[NIRF] Fetch failed:`, err instanceof Error ? err.message : err)
      return { colleges: [], courses: [], placements: [], cutoffs: [] }
    }
  }

  private async scrapeEngineering(): Promise<NIRFEntry[]> {
    const url = process.env.NIRF_URL || "https://www.nirfindia.org/2024/Engineering.html"
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CollegeDiscovery/1.0)" },
    })
    if (!res.ok) throw new Error(`NIRF page returned ${res.status}`)

    const html = await res.text()

    // Extract table rows — NIRF pages have <tr> inside <tbody>
    const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
    const entries: NIRFEntry[] = []

    for (const row of rows) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
      if (!cells || cells.length < 4) continue

      const rankText = cells[0]?.replace(/<[^>]+>/g, "").trim() || ""
      const rank = parseInt(rankText, 10)
      if (isNaN(rank)) continue

      const nameHtml = cells[1]
      const nameMatch = nameHtml?.match(/<a[^>]*>([\s\S]*?)<\/a>/i)
      const name = (nameMatch?.[1] || cells[1]?.replace(/<[^>]+>/g, "") || "").trim()
      if (!name) continue

      const cityStateText = cells[2]?.replace(/<[^>]+>/g, "").trim() || ""
      const [city = "", state = ""] = cityStateText.split(",").map((s: string) => s.trim())

      const scoreText = cells[cells.length - 1]?.replace(/<[^>]+>/g, "").trim() || ""
      const score = parseFloat(scoreText) || 0

      entries.push({ rank, name, city, state, score })
    }

    return entries
  }
}
