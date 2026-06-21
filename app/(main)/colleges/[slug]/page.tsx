import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { GraduationCap, MapPin, Calendar, Award, ExternalLink, Bookmark, GitCompare, Star } from "lucide-react"
import { Badge, Button } from "@/components/ui"
import CollegeDetailClient from "@/components/colleges/CollegeDetailClient"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const college = await prisma.college.findFirst({
    where: { OR: [{ slug: params.slug }, { id: params.slug }] },
    select: { name: true, city: true, state: true, overview: true },
  })
  if (!college) return { title: "College Not Found" }
  return {
    title: college.name,
    description: `${college.name} in ${college.city}, ${college.state}. ${(college.overview || "").slice(0, 150)}...`,
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

  return (
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

      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <Badge variant={college.type === "GOVERNMENT" ? "success" : college.type === "PRIVATE" ? "info" : "default"} size="md">
                {college.type.replace(/_/g, " ")}
              </Badge>
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

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button variant="outline">
                <Bookmark className="h-4 w-4" />
                Save College
              </Button>
              <Button variant="secondary">
                <GitCompare className="h-4 w-4" />
                Compare
              </Button>
              {college.website && (
                <a href={college.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  )
}
