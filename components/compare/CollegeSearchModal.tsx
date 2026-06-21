"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Check } from "lucide-react"
import { Badge, Skeleton } from "@/components/ui"
import type { CollegeCard } from "@/types"

interface CollegeSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (college: CollegeCard) => void
  excludeIds: string[]
}

export default function CollegeSearchModal({
  isOpen,
  onClose,
  onSelect,
  excludeIds,
}: CollegeSearchModalProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      return
    }
    let cancelled = false
    setIsLoading(true)
    fetch(`/api/colleges?search=${encodeURIComponent(debouncedQuery)}&limit=8`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setResults(json.data || [])
      })
      .catch(() => { if (!cancelled) setResults([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (college: any) => {
      const card: CollegeCard = {
        id: college.id,
        name: college.name,
        slug: college.slug,
        city: college.city,
        state: college.state,
        fees: college.fees,
        rating: college.rating,
        reviewCount: college.reviewCount,
        imageUrl: college.imageUrl,
        type: college.type,
        accreditation: college.accreditation,
        established: college.established,
        latestPlacement: college.placements?.[0]
          ? {
              averagePackage: college.placements[0].averagePackage,
              highestPackage: college.placements[0].highestPackage,
              placementRate: college.placements[0].placementRate,
              year: college.placements[0].year,
            }
          : null,
      }
      onSelect(card)
      onClose()
    },
    [onSelect, onClose]
  )

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add College to Compare</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search college name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!debouncedQuery && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Type to search colleges
            </div>
          )}

          {isLoading && (
            <div className="px-4 py-3 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}

          {!isLoading && debouncedQuery && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No colleges found for &apos;{debouncedQuery}&apos;
            </div>
          )}

          {!isLoading &&
            results.map((college: any) => {
              const isExcluded = excludeIds.includes(college.id)
              return (
                <button
                  key={college.id}
                  onClick={() => !isExcluded && handleSelect(college)}
                  disabled={isExcluded}
                  className={`w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100 text-left ${
                    isExcluded
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {college.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{college.name}</div>
                    <div className="text-sm text-gray-500">
                      {college.city}, {college.state}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={college.type === "GOVERNMENT" ? "success" : "info"} size="sm">
                      {college.type.replace(/_/g, " ")}
                    </Badge>
                    {isExcluded && (
                      <span className="text-xs text-gray-400 font-medium">Added</span>
                    )}
                  </div>
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
