"use client"

import Link from "next/link"
import { MapPin, IndianRupee, Plus, Check } from "lucide-react"
import { Badge, Button } from "@/components/ui"
import type { PredictorResult } from "@/types"

interface PredictorResultCardProps {
  result: PredictorResult
  chanceLevel: "SAFE" | "MODERATE" | "REACH"
  onAddCompare: (college: any) => void
  isInCompare: (collegeId: string) => boolean
}

export default function PredictorResultCard({
  result,
  chanceLevel,
  onAddCompare,
  isInCompare,
}: PredictorResultCardProps) {
  const { college, cutoff, chancePercentage } = result

  const chanceColor =
    chanceLevel === "SAFE" ? "text-green-600" :
    chanceLevel === "MODERATE" ? "text-yellow-600" :
    "text-red-600"

  const strokeColor =
    chanceLevel === "SAFE" ? "#16a34a" :
    chanceLevel === "MODERATE" ? "#ca8a04" :
    "#dc2626"

  const badgeVariant =
    chanceLevel === "SAFE" ? "success" :
    chanceLevel === "MODERATE" ? "warning" :
    "danger"

  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (chancePercentage / 100) * circumference

  function formatFees(n: number | null | undefined) {
    if (!n) return "N/A"
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    return `₹${n.toLocaleString("en-IN")}`
  }

  function formatLPA(n: number | null | undefined) {
    if (!n) return "N/A"
    const lpa = n / 100000
    return `${lpa % 1 === 0 ? lpa : lpa.toFixed(1)} LPA`
  }

  const alreadyInCompare = isInCompare(college.id)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/colleges/${college.slug}`}
            className="text-base font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
          >
            {college.name}
          </Link>

          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {college.city}, {college.state}
            <Badge variant={college.type === "GOVERNMENT" ? "success" : "info"} size="sm" className="ml-1.5">
              {college.type.replace(/_/g, " ")}
            </Badge>
          </p>

          <div className="text-sm text-gray-500 mt-2">
            <span className="font-medium text-gray-700">Opening: {cutoff.minRank}</span>
            <span className="mx-1.5">|</span>
            <span className="font-medium text-gray-700">Closing: {cutoff.maxRank}</span>
            {cutoff.course && (
              <span className="block text-xs text-gray-400 mt-0.5">(for {cutoff.course})</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <IndianRupee className="h-3.5 w-3.5" />
              {formatFees(college.fees)}
            </span>
            <span>{college.latestPlacement?.averagePackage ? `${formatLPA(college.latestPlacement.averagePackage)} Avg Package` : "Placement N/A"}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-shrink-0 w-24">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle
                cx="40" cy="40" r={radius} fill="none"
                stroke={strokeColor} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <span className={`absolute text-xl font-bold ${chanceColor}`}>
              {chancePercentage}%
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">Chance</p>
          <Badge variant={badgeVariant} size="sm" className="mt-1">
            {chanceLevel}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <Link href={`/colleges/${college.slug}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">View College</Button>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onAddCompare(college)}
          disabled={alreadyInCompare}
        >
          {alreadyInCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {alreadyInCompare ? "Added" : "Compare"}
        </Button>
      </div>
    </div>
  )
}
