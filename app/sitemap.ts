import type { MetadataRoute } from "next"

const BASE_URL = "https://college-discovery-platform-tbd1.onrender.com"

const collegeSlugs = [
  "iit-kharagpur", "iit-bombay", "iit-madras", "iit-kanpur", "iit-delhi",
  "iit-guwahati", "iit-roorkee", "iit-bhu", "iit-hyderabad", "iit-dhanbad",
  "iit-indore", "iit-gandhinagar", "iit-jodhpur", "iit-palakkad",
  "iit-tirupati", "iit-ropar", "iit-bhubaneswar", "iit-mandi", "iit-patna",
  "iit-jammu", "iit-goa", "iit-dharwad", "iit-bhilai",
  "nit-trichy", "nit-surathkal", "nit-warangal", "nit-calicut",
  "nit-rourkela", "mnnit-allahabad", "mnit-jaipur", "nit-durgapur",
  "svnit-surat", "vnit-nagpur", "nit-kurukshetra", "nit-silchar",
  "nit-hamirpur", "nit-jalandhar", "nit-jamshedpur", "nit-agartala",
  "nit-delhi", "nit-puducherry", "nit-meghalaya", "nit-mizoram",
  "nit-nagaland", "nit-manipur", "nit-sikkim", "nit-andhra-pradesh",
  "nit-patna", "nit-srinagar", "nit-uttarakhand", "nit-raipur",
  "nit-goa", "nit-arunachal-pradesh",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const collegeUrls = collegeSlugs.map((slug) => ({
    url: `${BASE_URL}/colleges/${slug}`,
    lastModified: new Date("2026-06-22"),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/colleges`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/predict`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    ...collegeUrls,
  ]
}
