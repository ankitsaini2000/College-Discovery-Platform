import { ScrapedCollege, ProgressCallback } from "../types"
import { DiskCache } from "../cache"
import { randomDelay } from "../browser"

const API_BASE = "https://collegedunia.com/web-api/listing"
const cache = new DiskCache("collegedunia-api")

// State slugs for Collegedunia listing URLs
const STATE_SLUGS: Record<string, string> = {
  "Andaman and Nicobar Islands": "andaman-and-nicobar-islands-colleges",
  "Andhra Pradesh": "andhra-pradesh-colleges",
  "Arunachal Pradesh": "arunachal-pradesh-colleges",
  "Assam": "assam-colleges",
  "Bihar": "bihar-colleges",
  "Chandigarh": "chandigarh-colleges",
  "Chhattisgarh": "chhattisgarh-colleges",
  "Dadra and Nagar Haveli and Daman and Diu": "dadra-and-nagar-haveli-and-daman-and-diu-colleges",
  "Delhi": "delhi-ncr-colleges",
  "Goa": "goa-colleges",
  "Gujarat": "gujarat-colleges",
  "Haryana": "haryana-colleges",
  "Himachal Pradesh": "himachal-pradesh-colleges",
  "Jammu and Kashmir": "jammu-and-kashmir-colleges",
  "Jharkhand": "jharkhand-colleges",
  "Karnataka": "karnataka-colleges",
  "Kerala": "kerala-colleges",
  "Ladakh": "ladakh-colleges",
  "Lakshadweep": "lakshadweep-colleges",
  "Madhya Pradesh": "madhya-pradesh-colleges",
  "Maharashtra": "maharashtra-colleges",
  "Manipur": "manipur-colleges",
  "Meghalaya": "meghalaya-colleges",
  "Mizoram": "mizoram-colleges",
  "Nagaland": "nagaland-colleges",
  "Odisha": "odisha-colleges",
  "Puducherry": "puducherry-colleges",
  "Punjab": "punjab-colleges",
  "Rajasthan": "rajasthan-colleges",
  "Sikkim": "sikkim-colleges",
  "Tamil Nadu": "tamil-nadu-colleges",
  "Telangana": "telangana-colleges",
  "Tripura": "tripura-colleges",
  "Uttar Pradesh": "uttar-pradesh-colleges",
  "Uttarakhand": "uttarakhand-colleges",
  "West Bengal": "west-bengal-colleges",
}

interface CDListingResponse {
  canonicalUrl: string
  fullUrl: string
  colleges: CDCollege[]
  count: number
  hasNext: boolean
}

interface CDCollege {
  college_id: string
  college_name: string
  college_short_form: string
  state: string
  college_city: string
  rating: string
  fees: { short_form: string; name: string; fee: number; fee_formatted: string; type: string; course_id: string }[] | null
  placement: { label: string; value: string | number }[] | null
  placement_percentage: string | null
  naac_grading: string | null
  exam: string[] | null
  approvals: string[] | null
  url: string
  tagline: string | null
}

async function fetchPage(urlSlug: string, page: number): Promise<CDListingResponse | null> {
  const payload = { url: urlSlug, page }
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64").replace(/=/g, "")
  const apiUrl = `${API_BASE}?data=${b64}`
  const cacheKey = `page_${urlSlug}_${page}`

  if (cache.has(cacheKey)) {
    return cache.get<CDListingResponse>(cacheKey)
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": `https://collegedunia.com/${urlSlug}`,
        "Origin": "https://collegedunia.com",
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = await res.json() as CDListingResponse
    if (data.colleges) {
      cache.set(cacheKey, data)
    }
    return data
  } catch {
    return null
  }
}

export async function scrapeCollegeduniaAPI(states: string[], onProgress: ProgressCallback): Promise<{ colleges: ScrapedCollege[]; errors: string[] }> {
  const colleges: ScrapedCollege[] = []
  const errors: string[] = []

  const progress = cache.loadProgress()
  const completedStates: string[] = progress?.completedStates as string[] || []

  for (let si = 0; si < states.length; si++) {
    const state = states[si]
    const urlSlug = STATE_SLUGS[state]
    if (!urlSlug) {
      errors.push(`No Collegedunia slug for: ${state}`)
      continue
    }
    if (completedStates.includes(state)) {
      onProgress(si + 1, states.length, `Skipping ${state} (already done)`)
      continue
    }

    onProgress(si + 1, states.length, `Fetching ${state}...`)

    // Fetch first page to get total count
    const firstPage = await fetchPage(urlSlug, 1)
    if (!firstPage || !firstPage.colleges || firstPage.colleges.length === 0) {
      errors.push(`No data for ${state}`)
      completedStates.push(state)
      cache.saveProgress({ completedStates, totalCollected: colleges.length })
      continue
    }

    const totalInState = firstPage.count || firstPage.colleges.length
    const totalPages = Math.ceil(totalInState / 10)
    onProgress(si + 1, states.length, `${state}: ~${totalInState} colleges, ${totalPages} pages`)

    // Collect all pages
    const allColleges: CDCollege[] = [...firstPage.colleges]
    for (let pg = 2; pg <= totalPages; pg++) {
      const pageData = await fetchPage(urlSlug, pg)
      if (pageData && pageData.colleges) {
        allColleges.push(...pageData.colleges)
      }
      if (pg % 10 === 0) {
        onProgress(si + 1, states.length, `${state}: page ${pg}/${totalPages} (${allColleges.length} collected)`)
      }
      await randomDelay(300)
    }

    onProgress(si + 1, states.length, `${state}: ${allColleges.length} colleges, converting...`)

    // Convert to ScrapedCollege format
    for (const cd of allColleges) {
      // Extract fees
      let fees: number | null = null
      if (cd.fees && cd.fees.length > 0) {
        // Find the lowest fee (usually the base program fee)
        const minFee = Math.min(...cd.fees.map((f) => f.fee || Infinity))
        if (minFee > 0 && minFee < Infinity) fees = minFee
      }

      // Extract placement average
      let placementAvg: number | null = null
      let placementHigh: number | null = null
      let placementRate: number | null = null
      if (cd.placement && Array.isArray(cd.placement)) {
        for (const p of cd.placement) {
          const label = (p.label || "").toLowerCase()
          const valStr = String(p.value || "").toLowerCase()
          const text = label + " " + valStr
          const avgM = text.match(/(?:average|avg)[:\s]*rs?\s*(\d+\.?\d*)/i)
          if (avgM) placementAvg = Math.round(parseFloat(avgM[1]) * 100000)
          const highM = text.match(/(?:highest|max)[:\s]*rs?\s*(\d+\.?\d*)/i)
          if (highM) placementHigh = Math.round(parseFloat(highM[1]) * 100000)
          const rateM = text.match(/(\d+\.?\d*)\s*%/i)
          if (rateM && text.indexOf("fees") === -1 && text.indexOf("fee") === -1) placementRate = parseFloat(rateM[1])
        }
      }
      if (!placementRate && cd.placement_percentage) {
        const r = parseFloat(cd.placement_percentage)
        if (!isNaN(r)) placementRate = r
      }

      colleges.push({
        name: cd.college_name,
        city: cd.college_city || "",
        state: cd.state || state,
        website: null,
        email: null,
        phone: null,
        fees,
        established: null,
        type: null,
        accreditation: cd.naac_grading || null,
        overview: cd.tagline || null,
        placementAvg,
        placementHigh,
        placementRate,
        topRecruiters: [],
        nirfRank: null,
        source: "COLLEGEDUNIA",
        sourceUrl: cd.url ? `https://collegedunia.com${cd.url.startsWith("/") ? cd.url : "/" + cd.url}` : "",
      })
    }

    completedStates.push(state)
    cache.saveProgress({ completedStates, totalCollected: colleges.length })
    // Save results after each state so we don't lose progress on crash
    cache.set("_results_checkpoint", { colleges, totalCollected: colleges.length })
  }

  return { colleges, errors }
}

export function loadCachedApiResults(): ScrapedCollege[] | null {
  const data = cache.get<{ colleges: ScrapedCollege[]; totalCollected: number }>("_results_checkpoint")
  return data?.colleges || null
}
