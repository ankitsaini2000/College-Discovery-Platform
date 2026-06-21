import { useState } from "react"
import type { Placement } from "@prisma/client"
import { Briefcase, TrendingUp, Users } from "lucide-react"

function formatLPA(pkg: number): string {
  const lpa = pkg / 100000
  return `${lpa % 1 === 0 ? lpa : lpa.toFixed(1)} LPA`
}

export default function PlacementsTab({ placements }: { placements: Placement[] }) {
  const [selectedYear, setSelectedYear] = useState<number>(
    placements.length > 0 ? placements[0].year : 0
  )

  if (placements.length === 0) {
    return (
      <div className="text-center py-16">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Placement data not available yet.</p>
      </div>
    )
  }

  const years = Array.from(new Set(placements.map((p) => p.year))).sort((a, b) => b - a)
  const current = placements.filter((p) => p.year === selectedYear)
  const latest = current[0]

  const prevYear = years.find((y) => y < selectedYear)
  const previous = prevYear ? placements.filter((p) => p.year === prevYear) : []
  const prevLatest = previous[0]

  return (
    <div className="space-y-8">
      <div className="flex gap-2 overflow-x-auto">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors whitespace-nowrap ${
              year === selectedYear
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-600">
            {latest ? formatLPA(latest.averagePackage) : "N/A"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Average CTC</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-blue-600">
            {latest ? formatLPA(latest.highestPackage) : "N/A"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Highest CTC</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-purple-600">
            {latest?.placementRate ? `${latest.placementRate}%` : "N/A"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Students Placed</p>
        </div>
      </div>

      {latest?.topRecruiters && latest.topRecruiters.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recruiting Companies</h3>
          <div className="flex flex-wrap gap-2">
            {latest.topRecruiters.map((recruiter) => (
              <span
                key={recruiter}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {recruiter}
              </span>
            ))}
          </div>
        </section>
      )}

      {previous && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Year over Year Comparison
          </h3>
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="text-left px-4 py-3">Year</th>
                  <th className="text-right px-4 py-3">Avg Package</th>
                  <th className="text-right px-4 py-3">Highest Package</th>
                  <th className="text-right px-4 py-3">Placement Rate</th>
                </tr>
              </thead>
              <tbody>
                {years.map((year) => {
                  const p = placements.filter((pl) => pl.year === year)[0]
                  if (!p) return null
                  const prev = years.find((y) => y > year)
                  const prevP = prev ? placements.filter((pl) => pl.year === prev)[0] : null
                  const avgUp = prevP ? p.averagePackage >= prevP.averagePackage : null
                  const highUp = prevP ? p.highestPackage >= prevP.highestPackage : null

                  return (
                    <tr key={year} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{year}</td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatLPA(p.averagePackage)}
                        {avgUp !== null && (
                          <span className={`ml-1 ${avgUp ? "text-green-500" : "text-red-500"}`}>
                            {avgUp ? "↑" : "↓"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatLPA(p.highestPackage)}
                        {highUp !== null && (
                          <span className={`ml-1 ${highUp ? "text-green-500" : "text-red-500"}`}>
                            {highUp ? "↑" : "↓"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {p.placementRate}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
