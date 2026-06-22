"use client"

import Link from "next/link"
import { MapPin, Star, TrendingUp, Award, Plus, Check } from "lucide-react"
import { Badge, Button } from "@/components/ui"
import type { PredictorResult, CollegeCard } from "@/types"

function formatFees(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString("en-IN")}`
}

function formatLPA(n: number) {
  const lpa = n / 100000
  return `${lpa % 1 === 0 ? lpa : lpa.toFixed(1)} LPA`
}

function formatRank(n: number) {
  return n.toLocaleString("en-IN")
}

export default function PredictorResultCard({
  result,
  chanceLevel,
  onAddCompare,
  isInCompare,
}: {
  result: PredictorResult
  chanceLevel: string
  onAddCompare: (college: CollegeCard) => void
  isInCompare: (id: string) => boolean
}) {
  const { college, cutoff, chancePercentage } = result
  const alreadyInCompare = isInCompare(college.id)

  const chanceColor = chanceLevel === "SAFE"
    ? "text-green-600 bg-green-50"
    : chanceLevel === "MODERATE"
    ? "text-yellow-600 bg-yellow-50"
    : "text-red-600 bg-red-50"

  const progressColor = chanceLevel === "SAFE"
    ? "bg-green-500"
    : chanceLevel === "MODERATE"
    ? "bg-yellow-500"
    : "bg-red-500"

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {college.nirfRank && (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                <Award className="h-3 w-3" />
                #{college.nirfRank}
              </span>
            )}
            <Badge variant={college.type === "GOVERNMENT" ? "success" : "info"} size="sm">
              {college.slug.startsWith("iit-") ? "IIT" : "NIT"}
            </Badge>
          </div>
          <Link href={`/colleges/${college.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
            {college.name}
          </Link>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {college.city}, {college.state}
          </div>
        </div>
        <div className={`text-center px-3 py-2 rounded-lg ${chanceColor}`}>
          <p className="text-lg font-bold">{chancePercentage}%</p>
          <p className="text-[10px] uppercase font-semibold tracking-wide">chance</p>
        </div>
      </div>

      {/* Branch / Course info */}
      {cutoff.course && (
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Branch</p>
          <p className="text-sm font-semibold text-gray-900">{cutoff.course}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>Opening: <span className="font-mono font-semibold text-gray-700">{formatRank(cutoff.minRank)}</span></span>
            <span>Closing: <span className="font-mono font-semibold text-gray-700">{formatRank(cutoff.maxRank)}</span></span>
          </div>
        </div>
      )}

      {/* Chance bar */}
      <div className="mb-3">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${chancePercentage}%` }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        {college.rating > 0 && (
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {college.rating?.toFixed(1)}
          </span>
        )}
        <span>{formatFees(college.fees)}/yr</span>
        {college.latestPlacement && (
          <span className="flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3 text-green-500" />
            {formatLPA(college.latestPlacement.averagePackage)} avg
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link href={`/colleges/${college.slug}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View Details
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs ${alreadyInCompare ? "text-green-600" : ""}`}
          onClick={() => {
            if (!alreadyInCompare) {
              onAddCompare(college)
            }
          }}
          disabled={alreadyInCompare}
        >
          {alreadyInCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {alreadyInCompare ? "Added" : "Compare"}
        </Button>
      </div>
    </div>
  )
}
