export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { MapPin, Calendar, Award, Star } from "lucide-react"
import { Badge } from "@/components/ui"
import CollegeDetailClient from "@/components/colleges/CollegeDetailClient"
import CollegeActions from "@/components/colleges/CollegeActions"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const college = await prisma.college.findFirst({
    where: { OR: [{ slug: params.slug }, { id: params.slug }] },
    select: { name: true, city: true, state: true, overview: true, imageUrl: true, fees: true, rating: true },
  })
  if (!college) return { title: "College Not Found" }
  const ogDescription = `${college.name} in ${college.city}, ${college.state} — Fees: ₹${(college.fees / 100000).toFixed(1)}L, Rating: ${college.rating}/5. ${(college.overview || "").slice(0, 120)}...`
  return {
    title: college.name,
    description: ogDescription,
    alternates: {
      canonical: `/colleges/${params.slug}`,
    },
    openGraph: {
      title: `${college.name} — Fees, Placements, Cutoffs & Reviews`,
      description: ogDescription,
      images: college.imageUrl ? [{ url: college.imageUrl, width: 800, height: 600, alt: college.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${college.name} — Fees, Placements, Cutoffs & Reviews`,
      description: ogDescription,
      images: college.imageUrl ? [college.imageUrl] : [],
    },
  }
}

export default async function CollegeDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const college = await prisma.college.findFirst({
    where: { OR: [{ slug: params.slug }, { id: params.slug }] },
    include: {
      courses: { orderBy: { fees: "asc" } },
      placements: { orderBy: { year: "desc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      cutoffRanks: { orderBy: { year: "desc" } },
      _count: { select: { savedBy: true, reviews: true } },
    },
  })

  if (!college) notFound()

  const user = await getCurrentUser()
  const latestPlacement = college.placements[0] ?? null

  const collegeSchema = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: college.name,
    url: `${process.env.AUTH_URL || "https://collegecompass-hub.netlify.app"}/colleges/${college.slug}`,
    description: college.overview?.slice(0, 200) || "",
    image: college.imageUrl || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: college.city,
      addressRegion: college.state,
      addressCountry: "IN",
    },
    ...(college.established && { foundingDate: String(college.established) }),
    ...(latestPlacement && {
      numberOfEmployees: { "@type": "QuantitativeValue", value: latestPlacement.averagePackage },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collegeSchema) }}
      />
      <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/colleges" className="hover:text-blue-600 transition-colors">Colleges</Link>
            <span>/</span>
            <span className="text-gray-900">{college.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      {college.imageUrl && (
        <div className="relative w-full h-[300px] lg:h-[400px]">
          <Image
            src={college.imageUrl}
            alt={college.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
      )}

      <div className={`bg-white border-b border-gray-200 py-8 ${college.imageUrl ? "-mt-8 relative z-10 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)]" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <Badge variant={college.type === "GOVERNMENT" ? "success" : college.type === "PRIVATE" ? "info" : "default"} size="md">
                {college.slug.startsWith("iit-") ? "IIT" : college.slug.match(/^(nit-|mnit-|mnnit-|vnit-|svnit-)/) ? "NIT" : college.type.replace(/_/g, " ")}
              </Badge>
              {college.nirfRank && (
                <Badge variant="info" size="md" className="ml-2">
                  <Award className="h-3.5 w-3.5" />
                  NIRF Rank #{college.nirfRank}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{college.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {college.city}, {college.state}
                </span>
                {college.established && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Est. {college.established}
                  </span>
                )}
                {college.accreditation && (
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {college.accreditation}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900 text-lg">
                    {college.rating?.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">({college._count.reviews} reviews)</span>
              </div>

              {college.examAccepted && college.examAccepted.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {college.examAccepted.map((exam) => (
                    <Badge key={exam} variant="info" size="sm">
                      {exam.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <CollegeActions
              college={{
                id: college.id,
                name: college.name,
                slug: college.slug,
                city: college.city,
                state: college.state,
                fees: college.fees,
                rating: college.rating,
                reviewCount: college._count.reviews,
                imageUrl: college.imageUrl,
                type: college.type,
                accreditation: college.accreditation,
                established: college.established,
                nirfRank: college.nirfRank,
                latestPlacement: latestPlacement ? {
                  averagePackage: latestPlacement.averagePackage,
                  highestPackage: latestPlacement.highestPackage,
                  placementRate: latestPlacement.placementRate,
                  year: latestPlacement.year,
                } : null,
              }}
              website={college.website}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {college.fees ? `₹${(college.fees / 100000).toFixed(1)}L` : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Annual Fees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {latestPlacement ? `${(latestPlacement.averagePackage / 100000).toFixed(1)} LPA` : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Avg Package</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {latestPlacement?.placementRate ? `${latestPlacement.placementRate}%` : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Placement Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{college.courses.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Courses</p>
            </div>
            {college.campusSize && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{college.campusSize}</p>
                <p className="text-xs text-gray-500 mt-0.5">Campus</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollegeDetailClient
          college={college}
          currentUserId={user?.id ?? null}
        />
      </div>
    </div>
    </>
  )
}
