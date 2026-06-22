"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button, Badge } from "@/components/ui"
import AuthPrompt from "@/components/shared/AuthPrompt"
import PredictorResultCard from "./PredictorResultCard"
import { useCompareStore } from "@/store/compareStore"
import type { PredictorResponse, PredictorResult } from "@/types"

const EXAMS = [
  { value: "JEE_ADVANCED", label: "JEE Advanced", description: "For IIT admissions", icon: "🏛️" },
  { value: "JEE_MAIN", label: "JEE Main", description: "For NIT admissions", icon: "🎓" },
]

const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "OBC", label: "OBC (Other Backward Class)" },
  { value: "SC", label: "SC (Scheduled Caste)" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "EWS", label: "EWS (Economically Weaker Section)" },
]

const QUOTAS = [
  { value: "", label: "All Quotas" },
  { value: "AI", label: "All India (AI)" },
  { value: "OS", label: "Other State (OS)" },
  { value: "HS", label: "Home State (HS)" },
]

const YEARS = [
  { value: 2024, label: "2024 (Latest)" },
  { value: 2023, label: "2023" },
]

const LOADING_MESSAGES = [
  "Analyzing your rank...",
  "Matching with JoSAA cutoff data...",
  "Finding colleges for you...",
  "Preparing your results...",
]

function getRankPlaceholder(exam: string) {
  switch (exam) {
    case "JEE_MAIN": return "Enter your JEE Main rank (1 – 250,000)"
    case "JEE_ADVANCED": return "Enter your JEE Advanced rank (1 – 50,000)"
    default: return "Select exam first"
  }
}

export default function PredictorClient() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [formData, setFormData] = useState({
    exam: "",
    rank: "",
    category: "GENERAL",
    year: "2024",
    quota: "",
    gender: "Gender-Neutral",
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

      if (formData.quota) params.set("quota", formData.quota)
      if (formData.gender) params.set("gender", formData.gender)

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
              <Badge variant={badgeVariant} size="sm">{resultsArr.length} results</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>

        <div className="relative">
          {!session && displayed.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 top-[180px] z-10 flex flex-col items-center justify-center">
              <AuthPrompt
                overlay
                message="Sign in to view all predictable branches"
                action="Sign In to Unlock"
                callbackUrl={pathname}
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {displayed.map((result, idx) => (
              <div key={result.cutoffId} className={!session && idx > 0 ? "filter blur-[5px] select-none pointer-events-none" : ""}>
                <PredictorResultCard
                  result={result}
                  chanceLevel={result.chanceLevel}
                  onAddCompare={addCollege}
                  isInCompare={isInCompare}
                />
              </div>
            ))}
          </div>
        </div>

        {session && resultsArr.length > showLimit && (
          <button
            onClick={() => toggleSection(sectionKey)}
            className="mt-4 w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show {remaining} More Results <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div ref={formRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          {/* Exam Selection - Card Style */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Exam <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXAMS.map((ex) => (
                <button
                  key={ex.value}
                  onClick={() => updateField("exam", ex.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    formData.exam === ex.value
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">{ex.icon}</span>
                  <div>
                    <p className={`font-semibold ${formData.exam === ex.value ? "text-blue-700" : "text-gray-900"}`}>{ex.label}</p>
                    <p className="text-xs text-gray-500">{ex.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <p className="text-xs text-gray-400 mt-1">
                  {formData.exam === "JEE_ADVANCED" ? "Enter your JEE Advanced All India Rank (AIR)" : "Enter your JEE Main All India Rank (AIR)"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
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

            {/* Show Quota selector only for JEE Main (NITs) */}
            {formData.exam === "JEE_MAIN" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quota</label>
                <select
                  value={formData.quota}
                  onChange={(e) => updateField("quota", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                >
                  {QUOTAS.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">NITs have Home State & Other State quotas</p>
              </div>
            )}

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
            className="w-full mt-6"
            onClick={handlePredict}
            disabled={!formData.exam || !formData.rank || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Predicting..." : formData.exam === "JEE_ADVANCED" ? "🏛️ Predict My IIT" : formData.exam === "JEE_MAIN" ? "🎓 Predict My NIT" : "Predict My Colleges"}
          </Button>

          <p className="text-xs text-gray-400 text-center mt-3">
            ⓘ Predictions based on JoSAA {formData.year || "2024"} cutoff data. Actual cutoffs may vary. Use as reference only.
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
                  <p className="text-xs text-green-600">{results.results.safe.length} results</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-lg">🟡</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-700">Moderate</p>
                  <p className="text-xs text-yellow-600">{results.results.moderate.length} results</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-lg border border-red-200">
                <span className="text-lg">🔴</span>
                <div>
                  <p className="text-sm font-semibold text-red-700">Reach</p>
                  <p className="text-xs text-red-600">{results.results.reach.length} results</p>
                </div>
              </div>
              <div className="flex items-center px-4 py-2.5 text-sm text-gray-500">
                Total: <span className="font-semibold text-gray-900 ml-1">{results.totalFound} results</span> matched
              </div>
            </div>
          </div>

          {results.totalFound === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No colleges found for your criteria</h3>
              <p className="text-gray-500 mb-6">Try adjusting your rank, category or quota selection</p>
              <Button variant="primary" onClick={scrollToForm}>Modify Search</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {renderResultsSection("Safe Choices", "🟢", results.results.safe, "safe", "border-green-500", "success", "Your rank is well within the closing rank. High chance of admission.")}
              {renderResultsSection("Moderate Chances", "🟡", results.results.moderate, "moderate", "border-yellow-500", "warning", "Your rank is near the closing rank. Moderate chance of admission.")}
              {renderResultsSection("Reach Options", "🔴", results.results.reach, "reach", "border-red-500", "danger", "Your rank is slightly above last year's closing rank. Apply as backup.")}
            </div>
          )}
        </div>
      )}
    </>
  )
}
