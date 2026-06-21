"use client"

import Link from "next/link"
import { MapPin, Bookmark, Star } from "lucide-react"
import { Card, Badge } from "@/components/ui"
import { useCompareStore } from "@/store/compareStore"
import { toast } from "sonner"
import type { CollegeCard as CollegeCardType } from "@/types"

function formatFees(fees: number): string {
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`
  return `₹${fees.toLocaleString()}`
}

function formatPackage(pkg: number): string {
  const lpa = pkg / 100000
  return `${lpa % 1 === 0 ? lpa : lpa.toFixed(1)} LPA`
}

const typeBadgeVariant: Record<string, "success" | "info" | "warning" | "default"> = {
  GOVERNMENT: "success",
  PRIVATE: "info",
  DEEMED: "warning",
  AUTONOMOUS: "default",
}

interface CollegeCardProps {
  college: CollegeCardType
  isSaved?: boolean
  onSave?: (collegeId: string) => void
  showCompareButton?: boolean
}

export default function CollegeCard({
  college,
  isSaved = false,
  onSave,
  showCompareButton = true,
}: CollegeCardProps) {
  const { addCollege, removeCollege, isInCompare, canAdd } = useCompareStore()
  const inCompare = isInCompare(college.id)

  function handleCompare() {
    if (inCompare) {
      removeCollege(college.id)
      toast.info(`${college.name} removed from comparison`)
    } else {
      const result = addCollege(college)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    }
  }

  return (
    <Card hover className="group overflow-hidden p-0">
      <Link href={`/colleges/${college.slug}`}>
        <div className="h-48 relative">
          {college.imageUrl ? (
            <img
              src={college.imageUrl}
              alt={college.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
              <span className="text-6xl font-bold text-blue-300">
                {college.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge
              variant={typeBadgeVariant[college.type] || "default"}
              size="sm"
            >
              {college.type.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/colleges/${college.slug}`}
            className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 hover:text-blue-600 transition-colors flex-1"
          >
            {college.name}
          </Link>
          {onSave && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onSave(college.id)
              }}
              className="shrink-0 mt-0.5"
            >
              <Bookmark
                className={`h-5 w-5 transition-colors ${
                  isSaved
                    ? "fill-blue-600 text-blue-600"
                    : "text-gray-400 hover:text-blue-600"
                }`}
              />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {college.city}, {college.state}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm mt-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-900">
            {college.rating?.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({college.reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400 block">Annual Fees</span>
            <span className="text-sm font-semibold text-gray-900 block">
              {college.fees ? formatFees(college.fees) : "N/A"}
            </span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400 block">Avg Package</span>
            <span className="text-sm font-semibold text-gray-900 block">
              {college.latestPlacement?.averagePackage
                ? formatPackage(college.latestPlacement.averagePackage)
                : "N/A"}
            </span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400 block">Placed</span>
            <span className="text-sm font-semibold text-gray-900 block">
              {college.latestPlacement?.placementRate
                ? `${college.latestPlacement.placementRate}%`
                : "N/A"}
            </span>
          </div>
        </div>

        {(college.accreditation || college.established) && (
          <div className="flex items-center gap-2 mt-3">
            {college.accreditation && (
              <span className="text-xs text-gray-500">
                {college.accreditation}
              </span>
            )}
            {college.accreditation && college.established && (
              <span className="text-xs text-gray-300">|</span>
            )}
            {college.established && (
              <span className="text-xs text-gray-500">
                Est. {college.established}
              </span>
            )}
          </div>
        )}
      </div>

      {showCompareButton && (
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={handleCompare}
            disabled={!inCompare && !canAdd()}
            className={`w-full text-sm font-medium py-1.5 rounded-lg transition-colors ${
              inCompare
                ? "text-red-500 hover:bg-red-50"
                : canAdd()
                ? "text-blue-600 hover:bg-blue-50"
                : "text-gray-400 cursor-not-allowed bg-gray-50"
            }`}
          >
            {inCompare ? "✓ In Comparison" : canAdd() ? "+ Add to Compare" : "Compare Full (max 3)"}
          </button>
        </div>
      )}
    </Card>
  )
}
