"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui"
import { Filter } from "lucide-react"
import AuthPrompt from "@/components/shared/AuthPrompt"
import type { CollegeWithRelations } from "@/types"

function formatRank(n: number): string {
  return n.toLocaleString("en-IN")
}

export default function CutoffsTab({ college }: { college: CollegeWithRelations }) {
  const { data: session } = useSession()
  const years = Array.from(new Set(college.cutoffRanks.map((c) => c.year))).sort((a, b) => b - a)
  
  const [selectedYear, setSelectedYear] = useState(years[0] || 2024)
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [selectedQuota, setSelectedQuota] = useState("ALL")
  const [selectedGender, setSelectedGender] = useState("ALL")
  
  const categories = ["ALL", ...Array.from(new Set(college.cutoffRanks.map((c) => c.category))).sort()]
  const quotas = ["ALL", ...Array.from(new Set(college.cutoffRanks.map((c) => c.quota).filter(Boolean) as string[])).sort()]
  const genders = ["ALL", ...Array.from(new Set(college.cutoffRanks.map((c) => c.gender).filter(Boolean) as string[])).sort()]

  const filteredData = useMemo(() => {
    return college.cutoffRanks.filter((c) => {
      if (c.year !== selectedYear) return false
      if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false
      if (selectedQuota !== "ALL" && c.quota !== selectedQuota) return false
      if (selectedGender !== "ALL" && c.gender !== selectedGender) return false
      return true
    })
  }, [college.cutoffRanks, selectedYear, selectedCategory, selectedQuota, selectedGender])

  if (college.cutoffRanks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No cutoff data available for this college yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Filter Cutoffs</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>

          {quotas.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Quota</label>
              <select
                value={selectedQuota}
                onChange={(e) => setSelectedQuota(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {quotas.map((q) => (
                  <option key={q} value={q}>{q === "ALL" ? "All Quotas" : q}</option>
                ))}
              </select>
            </div>
          )}

          {genders.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Gender Pool</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {genders.map((g) => (
                  <option key={g} value={g}>{g === "ALL" ? "All Genders" : g}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 text-sm">Cutoff Ranks {selectedYear}</h3>
          <Badge variant="info" size="sm">{filteredData.length} records</Badge>
        </div>
        
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No cutoffs found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto relative min-h-[300px]">
            {!session && (
              <AuthPrompt
                overlay
                message="Sign in to view all JoSAA cutoff data"
                action="Sign In to Unlock"
                callbackUrl={`/colleges/${college.slug}`}
              />
            )}
            <table className={`w-full border-collapse text-sm ${!session ? "filter blur-[5px] select-none pointer-events-none" : ""}`}>
              <thead>
                <tr className="bg-white text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                  <th className="text-left px-4 py-3 min-w-[200px]">Branch / Course</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Quota</th>
                  <th className="text-left px-4 py-3">Gender</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Opening Rank</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Closing Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">{c.course || "General"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.category === "GENERAL" ? "default" : "info"} size="sm">
                        {c.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.quota || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.gender || "-"}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-green-600">
                      {formatRank(c.minRank)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-red-600">
                      {formatRank(c.maxRank)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
