"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui"
import { useCollegeFilters } from "@/hooks/useCollegeFilters"

const collegeTypes = [
  { label: "All Types", value: null },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Private", value: "PRIVATE" },
  { label: "Deemed", value: "DEEMED" },
  { label: "Autonomous", value: "AUTONOMOUS" },
]

const exams = [
  { label: "All Exams", value: null },
  { label: "JEE Main", value: "JEE_MAIN" },
  { label: "JEE Advanced", value: "JEE_ADVANCED" }
]

const ratingOptions = [
  { label: "4.5 & above", value: "4.5" },
  { label: "4.0 & above", value: "4.0" },
  { label: "3.5 & above", value: "3.5" },
  { label: "3.0 & above", value: "3.0" },
]

const feeRanges = [
  { label: "Under ₹1L", value: "0-100000" },
  { label: "₹1L - ₹5L", value: "100000-500000" },
  { label: "₹5L - ₹10L", value: "500000-1000000" },
  { label: "Above ₹10L", value: "1000000-" },
]

interface FilterSidebarProps {
  states: string[]
}

export default function FilterSidebar({ states }: FilterSidebarProps) {
  const { setFilter, setFilters, clearFilters, getFilter, hasActiveFilters, isPending } = useCollegeFilters()

  const activeType = getFilter("type")
  const activeExam = getFilter("exam")
  const activeRating = getFilter("minRating")
  const activeState = getFilter("state")
  const activeFeeRange = getFilter("minFees") ? `${getFilter("minFees")}-${getFilter("maxFees") || ""}` : null

  function isActive(key: string, value: string | null) {
    if (value === null) return !getFilter(key as any)
    return getFilter(key as any) === value
  }

  return (
    <div className={`w-full lg:w-72 space-y-6 transition-opacity duration-150 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search colleges..."
            defaultValue={getFilter("search") || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim()
                setFilter("search", val || null)
              }
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">College Type</h3>
        <div className="space-y-2">
          {collegeTypes.map((t) => (
            <label
              key={t.label}
              className={`flex items-center gap-2 text-sm cursor-pointer ${isActive("type", t.value) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              <input
                type="radio"
                name="type"
                checked={isActive("type", t.value)}
                onChange={() => setFilter("type", t.value)}
                className="accent-blue-600"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Entrance Exam</h3>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {exams.map((exam) => (
            <label
              key={exam.label}
              className={`flex items-center gap-2 text-sm cursor-pointer ${isActive("exam", exam.value) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              <input
                type="radio"
                name="exam"
                checked={isActive("exam", exam.value)}
                onChange={() => setFilter("exam", exam.value)}
                className="accent-blue-600"
              />
              {exam.label}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Annual Fees</h3>
        <div className="flex flex-wrap gap-2">
          {feeRanges.map((range) => {
            const active = activeFeeRange === range.value
            return (
              <button
                key={range.label}
                onClick={() => {
                  const [min, max] = range.value.split("-")
                  setFilters({ minFees: min, maxFees: max || null })
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
                }`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {ratingOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 text-sm cursor-pointer ${isActive("minRating", opt.value) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              <input
                type="radio"
                name="rating"
                checked={isActive("minRating", opt.value)}
                onChange={() => setFilter("minRating", opt.value)}
                className="accent-blue-600"
              />
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.floor(parseFloat(opt.value))
                        ? "text-yellow-400"
                        : "text-gray-200"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1">{opt.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">State</h3>
        <select
          value={activeState || ""}
          onChange={(e) => setFilter("state", e.target.value || null)}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="danger"
          className="w-full justify-center text-sm"
          onClick={() => clearFilters()}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )
}
