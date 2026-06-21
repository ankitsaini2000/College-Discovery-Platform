"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Filter, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Button, SkeletonCollegeGrid } from "@/components/ui"
import CollegeCard from "@/components/colleges/CollegeCard"
import FilterSidebar from "@/components/colleges/FilterSidebar"
import type { CollegeCard as CollegeCardType, PaginatedResponse } from "@/types"

const sortOptions = [
  { label: "Top Rated", sortBy: "rating", sortOrder: "desc" },
  { label: "Lowest Fees", sortBy: "fees", sortOrder: "asc" },
  { label: "Highest Fees", sortBy: "fees", sortOrder: "desc" },
  { label: "Newest First", sortBy: "established", sortOrder: "desc" },
  { label: "Name A-Z", sortBy: "name", sortOrder: "asc" },
]

export default function CollegesClient({ states }: { states: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const paramsString = searchParams.toString()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["colleges", paramsString],
    queryFn: async () => {
      const res = await fetch(`/api/colleges?${paramsString}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json() as Promise<PaginatedResponse<CollegeCardType>>
    },
  })

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null) {
        params.delete(key)
      } else {
        if (key !== "page") {
          params.delete("page")
        }
        params.set(key, value)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const currentSort = sortOptions.find(
    (s) =>
      s.sortBy === (searchParams.get("sortBy") || "rating") &&
      s.sortOrder === (searchParams.get("sortOrder") || "desc")
  ) || sortOptions[0]

  const page = parseInt(searchParams.get("page") || "1")
  const totalPages = data?.pagination?.totalPages || 1

  function handleSortChange(sortKey: string) {
    const option = sortOptions[parseInt(sortKey)]
    updateParam("sortBy", option.sortBy)
    updateParam("sortOrder", option.sortOrder)
  }

  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push("...")
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i)
      }
      if (page < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          {isLoading ? "Loading..." : `${data?.pagination?.total || 0} colleges found`}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <select
            value={sortOptions.indexOf(currentSort)}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {sortOptions.map((opt, i) => (
              <option key={i} value={i}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCollegeGrid count={12} />
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">Something went wrong loading colleges</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">No colleges found</p>
          <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
          <Button
            variant="outline"
            onClick={() => router.push(pathname)}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                showCompareButton
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateParam("page", String(page - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => updateParam("page", String(p))}
                    className={`min-w-[36px] px-3 py-2 text-sm border rounded-lg transition-colors ${
                      p === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => updateParam("page", String(page + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar states={states} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
