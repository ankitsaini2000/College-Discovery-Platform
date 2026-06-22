import { ScrapedCollege, ProgressCallback } from "../types"
import { DiskCache } from "../cache"
import { randomDelay } from "../browser"
import * as cheerio from "cheerio"

const BASE = "https://www.shiksha.com"
const cache = new DiskCache("shiksha")

const STATE_SLUGS: Record<string, string> = {
  "Andhra Pradesh": "andhra-pradesh",
  "Arunachal Pradesh": "arunachal-pradesh",
  "Assam": "assam",
  "Bihar": "bihar",
  "Chhattisgarh": "chhattisgarh",
  "Goa": "goa",
  "Gujarat": "gujarat",
  "Haryana": "haryana",
  "Himachal Pradesh": "himachal-pradesh",
  "Jharkhand": "jharkhand",
  "Karnataka": "karnataka",
  "Kerala": "kerala",
  "Madhya Pradesh": "madhya-pradesh",
  "Maharashtra": "maharashtra",
  "Manipur": "manipur",
  "Meghalaya": "meghalaya",
  "Mizoram": "mizoram",
  "Nagaland": "nagaland",
  "Odisha": "odisha",
  "Punjab": "punjab",
  "Rajasthan": "rajasthan",
  "Sikkim": "sikkim",
  "Tamil Nadu": "tamil-nadu",
  "Telangana": "telangana",
  "Tripura": "tripura",
  "Uttar Pradesh": "uttar-pradesh",
  "Uttarakhand": "uttarakhand",
  "West Bengal": "west-bengal",
  "Delhi": "delhi",
  "Chandigarh": "chandigarh",
  "Puducherry": "puducherry",
  "Jammu and Kashmir": "jammu-and-kashmir",
}

async function fetchWithRetry(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(15000),
      })
      if (res.ok) return await res.text()
      if (res.status === 429) {
        await randomDelay(5000 * (i + 1))
        continue
      }
      if (res.status >= 400) return null
    } catch {
      if (i < retries - 1) await randomDelay(2000 * (i + 1))
    }
  }
  return null
}

function extractListingUrls(html: string): string[] {
  const $ = cheerio.load(html)
  const urls: string[] = []
  // Shiksha college links: /college/{name}-college-{id}
  $('a[href*="/college/"]').each((_, el) => {
    const href = $(el).attr("href")
    if (href && href.startsWith("/college/")) {
      // Filter out non-college pages
      if (!href.includes("/reviews") && !href.includes("/fees") && !href.includes("/courses") && !href.includes("/admission") && !href.includes("/placement") && !href.includes("/cutoff") && !href.includes("/ranking") && !href.includes("/scholarship")) {
        const full = href.startsWith("http") ? href : `${BASE}${href}`
        if (!urls.includes(full)) urls.push(full)
      }
    }
  })
  return urls
}

function getTotalPages(html: string): number {
  const $ = cheerio.load(html)
  // Shiksha pagination
  const pageLinks = $('a[class*="page"], a[class*="Page"], [class*="pagination"] a')
  let maxPg = 1
  pageLinks.each((_, el) => {
    const text = $(el).text().trim()
    const n = parseInt(text)
    if (!isNaN(n) && n > maxPg) maxPg = n
  })
  if (maxPg > 1) return Math.min(maxPg, 50)
  // Try result count
  const body = $("body").text()
  const m = body.match(/(\d+)\s+(?:Colleges?|results?)/i)
  if (m) {
    const total = parseInt(m[1])
    if (!isNaN(total)) return Math.ceil(total / 20)
  }
  return 1
}

async function scrapeListingPage(stateSlug: string, page: number): Promise<string[]> {
  const url = `${BASE}/colleges/colleges-in-${stateSlug}?page=${page}`
  const cacheKey = `listing_${stateSlug}_${page}`

  if (cache.has(cacheKey)) {
    return cache.get<string[]>(cacheKey)!
  }

  const html = await fetchWithRetry(url)
  if (!html) return []

  const urls = extractListingUrls(html)
  cache.set(cacheKey, urls)
  return urls
}

function extractCollegeData(url: string, html: string): Partial<ScrapedCollege> | null {
  const $ = cheerio.load(html)

  // Name
  const name = $("h1").first().text().trim() || $('h1[class*="heading"]').text().trim() || $('meta[property="og:title"]').attr("content")?.trim()
  if (!name) return null

  // City/state from breadcrumb or structured data
  let city = ""
  let state = ""
  const breadcrumb = $('[class*="breadcrumb"], [class*="Breadcrumb"], nav[aria-label="breadcrumb"]').text()
  // "Home > Colleges in Maharashtra > IIT Bombay"
  const stateMatch = breadcrumb.match(/Colleges?\s+in\s+([A-Za-z\s]+)/)
  if (stateMatch) state = stateMatch[1].trim()

  // Structured data
  const ldjson = $('script[type="application/ld+json"]').html()
  if (ldjson) {
    try {
      const parsed = JSON.parse(ldjson)
      const address = parsed.address || parsed.location?.address || {}
      if (address.addressLocality) city = address.addressLocality
      if (address.addressRegion) state = address.addressRegion
    } catch {}
  }

  // Fees
  let fees: number | null = null
  $('[class*="fee"], [class*="Fee"], [class*="Fees"]').each((_, el) => {
    const text = $(el).text().replace(/,/g, "")
    const m = text.match(/₹\s*(\d+[\d,]*)/)
    if (m) {
      const val = parseInt(m[1].replace(/,/g, ""))
      if (val > 1000 && (!fees || val < fees)) fees = val
    }
  })

  // Placement
  let placementAvg: number | null = null
  let placementHigh: number | null = null
  $('[class*="placement"], [class*="Placement"]').each((_, el) => {
    const text = $(el).text()
    const avgMatch = text.match(/(?:average|avg)[:\s]*₹?\s*(\d+\.?\d*)\s*(?:LPA|lpa)/i)
    if (avgMatch) placementAvg = Math.round(parseFloat(avgMatch[1]) * 100000)
    const highMatch = text.match(/(?:highest|max)[:\s]*₹?\s*(\d+\.?\d*)\s*(?:LPA|lpa)/i)
    if (highMatch) placementHigh = Math.round(parseFloat(highMatch[1]) * 100000)
  })

  // Website
  let website: string | null = null
  $('a[href*="."]').each((_, el) => {
    const href = $(el).attr("href") || ""
    const text = $(el).text().toLowerCase()
    if ((text.includes("website") || text.includes("official site") || text.includes("college website")) && href.startsWith("http")) {
      website = href
    }
  })

  // Email
  let email: string | null = null
  $('a[href*="mailto:"]').each((_, el) => {
    const e = $(el).attr("href")?.replace("mailto:", "").trim()
    if (e && e.includes("@")) email = e
  })

  // Phone
  let phone: string | null = null
  $('[class*="phone"], [class*="Phone"], [class*="call"]').each((_, el) => {
    const text = $(el).text().trim()
    const m = text.match(/\+?\d[\d\s-]{7,15}/)
    if (m) phone = m[0].trim()
  })

  // Overview
  const overview = $('[class*="about"], [class*="About"], [class*="description"]').first().text().trim().slice(0, 500)

  // NIRF rank
  let nirfRank: number | null = null
  $('[class*="rank"], [class*="Rank"]').each((_, el) => {
    const text = $(el).text()
    const m = text.match(/NIRF\s*(?:Rank|rank)\s*[#:]?\s*(\d+)/i)
    if (m) nirfRank = parseInt(m[1])
  })

  // Established
  let established: number | null = null
  $('span:contains("Established"), td:contains("Established")').each((_, el) => {
    const text = $(el).text()
    const m = text.match(/(\d{4})/)
    if (m) established = parseInt(m[1])
  })

  return {
    name, city, state, website, email, phone, fees, established,
    accreditation: null, overview, placementAvg, placementHigh,
    nirfRank,
  }
}

async function scrapeDetailPage(url: string): Promise<Partial<ScrapedCollege> | null> {
  const cacheKey = `detail_${url.replace(/[^a-zA-Z0-9]/g, "_")}`
  if (cache.has(cacheKey)) {
    return cache.get<Partial<ScrapedCollege>>(cacheKey)
  }

  const html = await fetchWithRetry(url)
  if (!html) return null

  const data = extractCollegeData(url, html)
  if (data) {
    data.sourceUrl = url
    cache.set(cacheKey, data)
  }
  return data
}

export async function scrapeShiksha(states: string[], onProgress: ProgressCallback): Promise<{ colleges: ScrapedCollege[]; errors: string[] }> {
  const colleges: ScrapedCollege[] = []
  const errors: string[] = []

  onProgress(0, states.length, "Collecting Shiksha listing pages...")

  const progress = cache.loadProgress()
  const completedStates: string[] = progress?.completedStates as string[] || []
  const completedListings: string[] = progress?.completedListings as string[] || []

  for (let si = 0; si < states.length; si++) {
    const state = states[si]
    const stateSlug = STATE_SLUGS[state]
    if (!stateSlug) {
      errors.push(`No Shiksha slug for state: ${state}`)
      continue
    }
    if (completedStates.includes(state)) {
      onProgress(si + 1, states.length, `Skipping ${state} (already done)`)
      continue
    }

    onProgress(si + 1, states.length, `Scraping Shiksha ${state}...`)

    const firstPageUrls = await scrapeListingPage(stateSlug, 1)
    if (firstPageUrls.length === 0) {
      errors.push(`No Shiksha colleges for ${state}`)
      continue
    }

    const listingHtml = await fetchWithRetry(`${BASE}/colleges/colleges-in-${stateSlug}`)
    const totalPages = listingHtml ? getTotalPages(listingHtml) : 1

    const allUrls: string[] = [...firstPageUrls]
    for (let pg = 2; pg <= totalPages; pg++) {
      const urls = await scrapeListingPage(stateSlug, pg)
      allUrls.push(...urls)
      await randomDelay(1000)
    }

    const uniqueUrls = Array.from(new Set(allUrls))
    onProgress(si + 1, states.length, `Shiksha ${state}: ${uniqueUrls.length} colleges`)

    for (let ui = 0; ui < uniqueUrls.length; ui++) {
      const url = uniqueUrls[ui]
      const listKey = `detail_${url.replace(/[^a-zA-Z0-9]/g, "_")}`
      if (completedListings.includes(listKey)) continue

      const data = await scrapeDetailPage(url)
      if (data && data.name) {
        colleges.push({
          name: data.name,
          city: data.city || "",
          state: data.state || state,
          website: data.website || null,
          email: data.email || null,
          phone: data.phone || null,
          fees: data.fees || null,
          established: data.established || null,
          type: null,
          accreditation: data.accreditation || null,
          overview: data.overview || null,
          placementAvg: data.placementAvg || null,
          placementHigh: data.placementHigh || null,
          placementRate: null,
          topRecruiters: [],
          nirfRank: data.nirfRank || null,
          source: "SHIKSHA",
          sourceUrl: url,
        })
        completedListings.push(listKey)
      }
      onProgress(si + 1, states.length, `Shiksha ${state}: ${ui + 1}/${uniqueUrls.length} (${colleges.length} total)`)
      await randomDelay(1500)
    }

    completedStates.push(state)
    cache.saveProgress({ completedStates, completedListings, totalCollected: colleges.length })
  }

  return { colleges, errors }
}
