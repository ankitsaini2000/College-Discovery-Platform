export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { SkeletonCollegeGrid } from "@/components/ui"
import CollegesClient from "@/components/colleges/CollegesClient"
import FilterSidebar from "@/components/colleges/FilterSidebar"

export const metadata: Metadata = {
  title: "Explore IITs & NITs | All 23 IITs & 31 NITs",
  description: "Browse all IITs and NITs in India. Filter by state, compare fees, placements, NIRF rankings and JoSAA cutoff data.",
}

export default async function CollegesPage({
  searchParams: _searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const total = await prisma.college.count()
  const statesResult = await prisma.college.findMany({
    distinct: ["state"],
    select: { state: true },
    orderBy: { state: "asc" },
  })
  const states = statesResult.map((s) => s.state)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore IITs & NITs</h1>
          <p className="text-gray-600 mt-1">Browse all {total} IITs and NITs across India — with real data</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          <div className="hidden lg:block shrink-0">
            <FilterSidebar states={states} />
          </div>
          <div className="flex-1 min-w-0">
            <Suspense fallback={<SkeletonCollegeGrid count={12} />}>
              <CollegesClient states={states} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
