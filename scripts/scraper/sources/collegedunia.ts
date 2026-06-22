import { ScrapedCollege, ProgressCallback } from "../types"
import { DiskCache } from "../cache"
import { randomDelay } from "../browser"
import * as cheerio from "cheerio"

const BASE = "https://collegedunia.com"
const cache = new DiskCache("collegedunia")

// State slug map for Collegedunia URLs
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
  "Delhi": "delhi-ncr",
  "Chandigarh": "chandigarh",
  "Puducherry": "puducherry",
  "Jammu and Kashmir": "jammu-and-kashmir",
  "Ladakh": "ladakh",
  "Andaman and Nicobar Islands": "andaman-and-nicobar-islands",
  "Dadra and Nagar Haveli and Daman and Diu": "dadra-nagar-haveli-daman-diu",
  "Lakshadweep": "lakshadweep",
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
  // Collegedunia listing page college links
  $('a[href*="/college/"]').each((_, el) => {
    const href = $(el).attr("href")
    if (href && href.startsWith("/college/") && !href.includes("/reviews") && !href.includes("/admission") && !href.includes("/cutoff") && !href.includes("/placement") && !href.includes("/courses") && !href.includes("/fees")) {
      const full = href.startsWith("http") ? href : `${BASE}${href}`
      if (!urls.includes(full)) urls.push(full)
    }
  })
  // Also check for links like /<city-name>/colleges/<college-name>-college-<id>
  $('a[href*="-college-"]').each((_, el) => {
    const href = $(el).attr("href")
    if (href && href.startsWith("/") && href.includes("-college-")) {
      const full = `${BASE}${href}`
      if (!urls.includes(full)) urls.push(full)
    }
  })
  return urls
}

function getTotalPages(html: string): number {
  const $ = cheerio.load(html)
  const lastLink = $('a[aria-label*="page"], a.pagination__page:last-child').last()
  if (lastLink.length) {
    const text = lastLink.text().trim()
    const n = parseInt(text)
    if (!isNaN(n)) return Math.min(n, 50) // cap at 50 pages
  }
  // Try finding "Page X of Y"
  const body = $("body").text()
  const m = body.match(/(\d+)\s*(?:pages?|results)/i)
  if (m) {
    const total = parseInt(m[1])
    if (!isNaN(total)) return Math.ceil(total / 25) // ~25 per page
  }
  return 1
}

async function scrapeListingPage(stateSlug: string, page: number): Promise<string[]> {
  const url = `${BASE}/${stateSlug}-colleges?page=${page}`
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

  // Extract name from h1
  const name = $("h1").first().text().trim() || $('h1[class*="title"]').text().trim() || $('meta[property="og:title"]').attr("content")?.trim()
  if (!name) return null

  // Extract city from breadcrumb or location
  let city = ""
  let state = ""
  // Breadcrumb: Home > Maharashtra Colleges > IIT Bombay Mumbai
  const breadcrumb = $('[class*="breadcrumb"], [class*="Breadcrumb"], nav[aria-label="breadcrumb"]').text()
  const bcMatch = breadcrumb.match(/([A-Za-z\s]+)\s*Colleges?\s*>/)
  if (bcMatch) state = bcMatch[1].trim()
  // Try to find city in title or meta
  const titleText = $("title").text()
  const cityMatch = titleText.match(/in\s+([A-Za-z\s]+?)\s*(?:-\s*|$)/)
  if (cityMatch) city = cityMatch[1].trim()

  // Fees
  let fees: number | null = null
  $('[class*="fee"], [class*="Fees"], td:contains("₹"), span:contains("₹")').each((_, el) => {
    const text = $(el).text().replace(/,/g, "")
    const m = text.match(/₹\s*(\d+[\d,]*)/)
    if (m) {
      const val = parseInt(m[1].replace(/,/g, ""))
      if (val > 1000 && (!fees || val < fees)) fees = val
    }
  })

  // Placement average
  let placementAvg: number | null = null
  let placementHigh: number | null = null
  $('[class*="placement"], [class*="Placement"]').each((_, el) => {
    const text = $(el).text()
    const avgMatch = text.match(/(?:average|avg|mean)\s*(?:package|salary|lpa|ctc)[:\s]*₹?\s*(\d+\.?\d*)/i)
    if (avgMatch) placementAvg = Math.round(parseFloat(avgMatch[1]) * 100000)
    const highMatch = text.match(/(?:highest|max|maximum)\s*(?:package|salary|lpa|ctc)[:\s]*₹?\s*(\d+\.?\d*)/i)
    if (highMatch) placementHigh = Math.round(parseFloat(highMatch[1]) * 100000)
  })

  // Website
  let website: string | null = null
  $('a[href*="."]').each((_, el) => {
    const href = $(el).attr("href") || ""
    const text = $(el).text().toLowerCase()
    if ((text.includes("website") || text.includes("visit") || text.includes("official")) && href.startsWith("http")) {
      website = href
    }
  })
  if (!website) {
    $('a[rel*="noopener"], a[target="_blank"]').each((_, el) => {
      const href = $(el).attr("href") || ""
      if (href.startsWith("http") && !href.includes("collegedunia") && !href.includes("facebook") && !href.includes("twitter") && !href.includes("instagram") && !href.includes("linkedin")) {
        website = href
      }
    })
  }

  // Email
  let email: string | null = null
  $('a[href*="mailto:"]').each((_, el) => {
    const e = $(el).attr("href")?.replace("mailto:", "").trim()
    if (e && e.includes("@")) email = e
  })

  // Phone
  let phone: string | null = null
  $('[class*="phone"], [class*="Phone"], [class*="contact"], [class*="Contact"], td:contains("+91-"), span:contains("+91-")').each((_, el) => {
    const text = $(el).text().trim()
    const m = text.match(/\+?\d[\d\s-]{7,15}/)
    if (m) phone = m[0].trim()
  })

  // Overview
  const overview = $('[class*="about"], [class*="About"], [class*="description"], [class*="Description"]').first().text().trim().slice(0, 500)

  // NIRF rank
  let nirfRank: number | null = null
  $('[class*="rank"], [class*="Rank"]').each((_, el) => {
    const text = $(el).text()
    const m = text.match(/NIRF\s*(?:Rank|rank)\s*[#:]?\s*(\d+)/i)
    if (m) nirfRank = parseInt(m[1])
  })

  // Established
  let established: number | null = null
  $('[class*="established"], [class*="Established"]').each((_, el) => {
    const text = $(el).text()
    const m = text.match(/(?:established|estd\.?|founded)[:\s]*(\d{4})/i)
    if (m) established = parseInt(m[1])
  })

  // Accreditation
  let accreditation: string | null = null
  $('[class*="accredit"], [class*="Accredit"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text && text.length < 100) accreditation = text
  })

  return {
    name,
    city,
    state,
    website,
    email,
    phone,
    fees,
    established,
    accreditation,
    overview,
    placementAvg,
    placementHigh,
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

export async function scrapeCollegedunia(states: string[], onProgress: ProgressCallback): Promise<{ colleges: ScrapedCollege[]; errors: string[] }> {
  const colleges: ScrapedCollege[] = []
  const errors: string[] = []

  // Collect all listing URLs
  onProgress(0, states.length, "Collecting listing pages...")
  let totalListings = 0

  // Load progress if resuming
  const progress = cache.loadProgress()
  const completedStates: string[] = progress?.completedStates as string[] || []
  const completedListings: string[] = progress?.completedListings as string[] || []

  for (let si = 0; si < states.length; si++) {
    const state = states[si]
    const stateSlug = STATE_SLUGS[state]
    if (!stateSlug) {
      errors.push(`No Collegedunia slug for state: ${state}`)
      continue
    }
    if (completedStates.includes(state)) {
      onProgress(si + 1, states.length, `Skipping ${state} (already done)`)
      continue
    }

    onProgress(si + 1, states.length, `Scraping ${state}...`)

    // Scrape first page to get total pages
    const firstPageUrls = await scrapeListingPage(stateSlug, 1)
    if (firstPageUrls.length === 0) {
      errors.push(`No colleges found for ${state}`)
      continue
    }

    // Estimate total pages from listing HTML
    const listingHtml = await fetchWithRetry(`${BASE}/${stateSlug}-colleges`)
    const totalPages = listingHtml ? getTotalPages(listingHtml) : 1

    totalListings += firstPageUrls.length * totalPages

    const allUrls: string[] = [...firstPageUrls]
    for (let pg = 2; pg <= totalPages; pg++) {
      const urls = await scrapeListingPage(stateSlug, pg)
      allUrls.push(...urls)
      await randomDelay(1000)
    }

    // Remove duplicates
    const uniqueUrls = Array.from(new Set(allUrls))
    onProgress(si + 1, states.length, `${state}: ${uniqueUrls.length} colleges found`)

    // Scrape detail pages
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
          source: "COLLEGEDUNIA",
          sourceUrl: url,
        })
        completedListings.push(listKey)
      }
      onProgress(si + 1, states.length, `${state}: ${ui + 1}/${uniqueUrls.length} (${colleges.length} total)`)
      await randomDelay(1500)
    }

    completedStates.push(state)
    cache.saveProgress({ completedStates, completedListings, totalCollected: colleges.length })
  }

  return { colleges, errors }
}
