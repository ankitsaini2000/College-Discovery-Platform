import { Calendar, Building2, Award, MapPin, Globe, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui"
import type { CollegeWithRelations } from "@/types"

function formatRank(n: number): string {
  return n.toLocaleString("en-IN")
}

export default function OverviewTab({ college }: { college: CollegeWithRelations }) {
  const highlights = [
    { icon: Calendar, label: "Established", value: college.established || "N/A" },
    { icon: Building2, label: "Type", value: college.type.replace(/_/g, " ") },
    { icon: Award, label: "Accreditation", value: college.accreditation || "N/A" },
    { icon: MapPin, label: "Location", value: `${college.city}, ${college.state}` },
    {
      icon: Globe,
      label: "Website",
      value: college.website ? (
        <a
          href={college.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {college.website.replace(/^https?:\/\//, "")}
        </a>
      ) : "N/A",
    },
    {
      icon: BookOpen,
      label: "Exams Accepted",
      value: college.examAccepted?.length ? (
        <div className="flex flex-wrap gap-1">
          {college.examAccepted.map((e) => (
            <Badge key={e} variant="info" size="sm">
              {e.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      ) : "N/A",
    },
  ]

  const years = Array.from(new Set(college.cutoffRanks.map((c) => c.year))).sort((a, b) => b - a)
  const cutoffYear = years[0] || 2024
  const cutoffData = college.cutoffRanks.filter((c) => c.year === cutoffYear)

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About {college.name}</h2>
        <p className="text-gray-700 leading-relaxed">{college.overview || "No description available."}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.map((h) => {
            const Icon = h.icon
            return (
              <div key={h.label} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{h.label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{h.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Cutoff Ranks {cutoffYear}</h2>
          {years.length > 1 && (
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700">
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        {cutoffData.length === 0 ? (
          <p className="text-gray-500 text-sm">Cutoff data not available yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="text-left px-4 py-3">Exam</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-right px-4 py-3">Opening Rank</th>
                  <th className="text-right px-4 py-3">Closing Rank</th>
                </tr>
              </thead>
              <tbody>
                {cutoffData.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Badge variant="info" size="sm">{c.exam.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.category}</td>
                    <td className="px-4 py-3 text-gray-900">{c.course}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-blue-600">
                      {formatRank(c.minRank)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-blue-600">
                      {formatRank(c.maxRank)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
        <p className="text-gray-700 mb-3">
          {college.city}, {college.state}, {college.country}
        </p>
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(college.name + " " + college.city)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <MapPin className="h-4 w-4" />
          View on Google Maps
        </a>
      </section>
    </div>
  )
}
