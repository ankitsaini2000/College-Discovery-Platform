"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button, Badge, Skeleton } from "@/components/ui"
import PredictorResultCard from "./PredictorResultCard"
import { useCompareStore } from "@/store/compareStore"
import type { PredictorResponse, PredictorResult } from "@/types"

const EXAMS = [
  { value: "JEE_MAIN", label: "JEE Main" },
  { value: "JEE_ADVANCED", label: "JEE Advanced" },
  { value: "NEET", label: "NEET" },
  { value: "CAT", label: "CAT" },
  { value: "GATE", label: "GATE" },
  { value: "XAT", label: "XAT" },
  { value: "CLAT", label: "CLAT" },
  { value: "STATE_CET", label: "State CET" },
]

const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "OBC", label: "OBC (Other Backward Class)" },
  { value: "SC", label: "SC (Scheduled Caste)" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "EWS", label: "EWS (Economically Weaker Section)" },
]

const YEARS = [
  { value: 2024, label: "2024 (Recommended)" },
  { value: 2023, label: "2023" },
  { value: 2022, label: "2022" },
]

const LOADING_MESSAGES = [
  "Analyzing your rank...",
  "Matching with cutoff data...",
  "Preparing your results...",
]

function getRankPlaceholder(exam: string) {
  switch (exam) {
    case "JEE_MAIN": return "Enter rank (1 – 1,000,000)"
    case "JEE_ADVANCED": return "Enter rank (1 – 50,000)"
    case "NEET": return "Enter rank (1 – 1,000,000)"
    case "CAT": return "Enter percentile rank (1 – 100)"
    default: return "Enter your rank"
  }
}

function getRankHint(exam: string) {
  switch (exam) {
    case "JEE_MAIN": return "Enter your JEE Main All India Rank"
    case "JEE_ADVANCED": return "Enter your JEE Advanced All India Rank"
    case "NEET": return "Enter your NEET All India Rank"
    case "CAT": return "Enter your overall rank (not percentile)"
    default: return ""
  }
}

export default function PredictorClient() {
  const [formData, setFormData] = useState({
    exam: "",
    rank: "",
    category: "GENERAL",
    year: "2024",
  })
  const [results, setResults] = useState<PredictorResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    safe: false,
    moderate: false,
    reach: false,
  })
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const addCollege = useCompareStore((s) => s.addCollege)
  const isInCompare = useCompareStore((s) => s.isInCompare)

  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 800)
    return () => clearInterval(interval)
  }, [isLoading])

  const handlePredict = useCallback(async () => {
    if (!formData.exam || !formData.rank) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    setResults(null)

    try {
      const params = new URLSearchParams({
        exam: formData.exam,
        rank: formData.rank,
        category: formData.category,
        year: formData.year,
      })

      const res = await fetch(`/api/predict?${params}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Something went wrong")
        return
      }

      setResults(json.data)

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch {
      setError("Failed to fetch predictions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [formData])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleSection = (section: "safe" | "moderate" | "reach") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const renderResultsSection = (
    label: string,
    icon: string,
    resultsArr: PredictorResult[],
    sectionKey: "safe" | "moderate" | "reach",
    borderColor: string,
    badgeVariant: "success" | "warning" | "danger",
    description: string
  ) => {
    if (resultsArr.length === 0) return null

    const showLimit = 6
    const isExpanded = expandedSections[sectionKey]
    const displayed = isExpanded ? resultsArr : resultsArr.slice(0, showLimit)
    const remaining = resultsArr.length - showLimit

    return (
      <div className={`border-l-4 ${borderColor} bg-white rounded-xl shadow-sm border border-gray-200 p-6`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <h3 className="text-xl font-bold text-gray-900">{label}</h3>
              <Badge variant={badgeVariant} size="sm">{resultsArr.length} colleges</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((result) => (
            <PredictorResultCard
              key={result.cutoffId}
              result={result}
              chanceLevel={result.chanceLevel}
              onAddCompare={addCollege}
              isInCompare={isInCompare}
            />
          ))}
        </div>

        {resultsArr.length > showLimit && (
          <button
            onClick={() => toggleSection(sectionKey)}
            className="mt-4 w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show {remaining} More Colleges <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div ref={formRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Exam <span className="text-red-500">*</span></label>
              <select
                value={formData.exam}
                onChange={(e) => updateField("exam", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              >
                <option value="" disabled>-- Select Exam --</option>
                {EXAMS.map((ex) => (
                  <option key={ex.value} value={ex.value}>{ex.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rank <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={1}
                placeholder={getRankPlaceholder(formData.exam)}
                value={formData.rank}
                onChange={(e) => updateField("rank", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.exam && (
                <p className="text-xs text-gray-400 mt-1">{getRankHint(formData.exam)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Category</label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cutoff Year</label>
              <select
                value={formData.year}
                onChange={(e) => updateField("year", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-5"
            onClick={handlePredict}
            disabled={!formData.exam || !formData.rank || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Predicting..." : "Predict My Colleges"}
          </Button>

          <p className="text-xs text-gray-400 text-center mt-3">
            ⓘ Predictions are based on previous year cutoff data. Actual cutoffs may vary. Use this as a reference only.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-gray-500 text-lg animate-pulse">{LOADING_MESSAGES[loadingMsgIndex]}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <Button variant="ghost" onClick={scrollToForm} className="mt-3 text-red-600 hover:bg-red-100">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {hasSearched && !isLoading && !error && results && (
        <div ref={resultsRef} id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Showing results for</span>
              <Badge variant="info" size="sm">{EXAMS.find((e) => e.value === results.input.exam)?.label || results.input.exam}</Badge>
              <span className="text-sm font-semibold text-gray-900">Rank {results.input.rank.toLocaleString("en-IN")}</span>
              <Badge variant="outline" size="sm">{CATEGORIES.find((c) => c.value === results.input.category)?.label.split(" ")[0] || results.input.category}</Badge>
              <Badge variant="outline" size="sm">{results.input.year}</Badge>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-lg border border-green-200">
                <span className="text-lg">🟢</span>
                <div>
                  <p className="text-sm font-semibold text-green-700">Safe</p>
                  <p className="text-xs text-green-600">{results.results.safe.length} colleges</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-lg">🟡</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-700">Moderate</p>
                  <p className="text-xs text-yellow-600">{results.results.moderate.length} colleges</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-lg border border-red-200">
                <span className="text-lg">🔴</span>
                <div>
                  <p className="text-sm font-semibold text-red-700">Reach</p>
                  <p className="text-xs text-red-600">{results.results.reach.length} colleges</p>
                </div>
              </div>
              <div className="flex items-center px-4 py-2.5 text-sm text-gray-500">
                Total: <span className="font-semibold text-gray-900 ml-1">{results.totalFound} colleges</span> matched your criteria
              </div>
            </div>
          </div>

          {results.totalFound === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No colleges found for your criteria</h3>
              <p className="text-gray-500 mb-6">Try adjusting your rank or selecting a different category or year</p>
              <Button variant="primary" onClick={scrollToForm}>Modify Search</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {renderResultsSection("Safe Colleges", "🟢", results.results.safe, "safe", "border-green-500", "success", "Your rank is well within the closing rank. High chance of admission.")}
              {renderResultsSection("Moderate Colleges", "🟡", results.results.moderate, "moderate", "border-yellow-500", "warning", "Your rank is near the closing rank. Moderate chance of admission.")}
              {renderResultsSection("Reach Colleges", "🔴", results.results.reach, "reach", "border-red-500", "danger", "Your rank is slightly above last year's closing rank. Apply as backup options.")}
            </div>
          )}
        </div>
      )}
    </>
  )
}
