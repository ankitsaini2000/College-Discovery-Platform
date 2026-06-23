import { prisma } from "@/lib/prisma"

const BASE_URL = "https://collegecompass-hub.netlify.app"

export default async function sitemap() {
  const colleges = await prisma.college.findMany({
    select: { slug: true, updatedAt: true },
    where: { status: "ACTIVE" },
  })

  const collegeUrls = colleges.map((college) => ({
    url: `${BASE_URL}/colleges/${college.slug}`,
    lastModified: college.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const staticUrls = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/colleges`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/predict`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ]

  return [...staticUrls, ...collegeUrls]
}
