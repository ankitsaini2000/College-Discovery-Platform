"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bookmark, GitCompare, Plus, Trash2, ExternalLink } from "lucide-react"
import { Button, Skeleton } from "@/components/ui"
import CollegeCard from "@/components/colleges/CollegeCard"
import { useCompareStore } from "@/store/compareStore"
import { useSavedColleges, useSavedComparisons, useDeleteComparison } from "@/hooks/useSaved"
import type { SavedComparisonWithColleges, CollegeCard as CollegeCardType } from "@/types"

interface DashboardClientProps {
  userId: string
}

type Tab = "saved" | "comparisons"

export default function DashboardClient({ userId }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("saved")
  const router = useRouter()
  const { addCollege, clearAll } = useCompareStore()

  const {
    data: savedCollegesData,
    isLoading: collegesLoading,
    isError: collegesError,
    refetch: refetchColleges,
  } = useSavedColleges()

  const {
    data: comparisonsData,
    isLoading: comparisonsLoading,
    isError: comparisonsError,
    refetch: refetchComparisons,
  } = useSavedComparisons()

  const deleteComparison = useDeleteComparison()

  const savedColleges = savedCollegesData?.data || []
  const comparisons = comparisonsData?.data || []

  function formatDate(dateStr: string | Date) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  function handleDeleteComparison(comparisonId: string) {
    deleteComparison.mutate(comparisonId)
  }

  function handleViewComparison(comparison: SavedComparisonWithColleges) {
    clearAll()
    addComparisonCollege(comparison.collegeA)
    addComparisonCollege(comparison.collegeB)
    if (comparison.collegeC) addComparisonCollege(comparison.collegeC)
    router.push("/compare")
  }

  function addComparisonCollege(college: SavedComparisonWithColleges["collegeA"]) {
    addCollege(college as CollegeCardType)
  }

  const tabClass = (tab: Tab) =>
    `px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{collegesLoading ? "-" : savedColleges.length}</p>
          <p className="text-sm text-gray-500">Saved Colleges</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{comparisonsLoading ? "-" : comparisons.length}</p>
          <p className="text-sm text-gray-500">Saved Comparisons</p>
        </div>
        <Link href="/colleges" className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all block">
          <p className="text-2xl font-bold text-blue-600">
            <Plus className="h-6 w-6 mx-auto" />
          </p>
          <p className="text-sm text-gray-500">Explore More</p>
        </Link>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <button className={tabClass("saved")} onClick={() => setActiveTab("saved")}>
          Saved Colleges
        </button>
        <button className={tabClass("comparisons")} onClick={() => setActiveTab("comparisons")}>
          Saved Comparisons
        </button>
      </div>

      {activeTab === "saved" && (
        <>
          {collegesLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <Skeleton className="h-48 rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {collegesError && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Failed to load saved colleges</p>
              <Button variant="outline" onClick={() => refetchColleges()}>
                Try Again
              </Button>
            </div>
          )}

          {!collegesLoading && !collegesError && savedColleges.length === 0 && (
            <div className="text-center py-16">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved colleges yet</h3>
              <p className="text-gray-500 mb-6">Browse colleges and save them to see them here</p>
              <Link href="/colleges">
                <Button variant="primary">Browse Colleges</Button>
              </Link>
            </div>
          )}

          {!collegesLoading && !collegesError && savedColleges.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-4">Your Saved Colleges ({savedColleges.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedColleges.map((saved) => (
                  <CollegeCard
                    key={saved.id}
                    college={saved.college}
                    showCompareButton={true}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "comparisons" && (
        <>
          {comparisonsLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                  <div className="flex gap-3 mt-4">
                    <Skeleton className="h-9 w-32 rounded-lg" />
                    <Skeleton className="h-9 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {comparisonsError && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Failed to load saved comparisons</p>
              <Button variant="outline" onClick={() => refetchComparisons()}>
                Try Again
              </Button>
            </div>
          )}

          {!comparisonsLoading && !comparisonsError && comparisons.length === 0 && (
            <div className="text-center py-16">
              <GitCompare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved comparisons yet</h3>
              <p className="text-gray-500 mb-6">Compare colleges and save your comparisons to see them here</p>
              <Link href="/compare">
                <Button variant="primary">Compare Colleges</Button>
              </Link>
            </div>
          )}

          {!comparisonsLoading && !comparisonsError && comparisons.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-4">Your Saved Comparisons ({comparisons.length})</p>
              <div className="space-y-4">
                {comparisons.map((comparison) => (
                  <div key={comparison.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {comparison.collegeA.name}
                      </span>
                      <span className="text-gray-400 text-sm font-medium">vs</span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {comparison.collegeB.name}
                      </span>
                      {comparison.collegeC && (
                        <>
                          <span className="text-gray-400 text-sm font-medium">vs</span>
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {comparison.collegeC.name}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Saved on {formatDate(comparison.createdAt)}</p>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewComparison(comparison)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Comparison
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteComparison(comparison.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
