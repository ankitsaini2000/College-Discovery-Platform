"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { MapPin, Bookmark, Star, Award } from "lucide-react"
import { Card, Badge } from "@/components/ui"
import { useCompareStore } from "@/store/compareStore"
import { useSaveCollege, useUnsaveCollege } from "@/hooks/useSaved"
import { useSavedIds } from "@/hooks/useSavedIds"
import { cn } from "@/lib/utils"
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
  showCompareButton?: boolean
}

export default function CollegeCard({
  college,
  showCompareButton = true,
}: CollegeCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isSaved, getSavedId } = useSavedIds()
  const { mutate: saveCollege, isPending: isSaving } = useSaveCollege()
  const { mutate: unsaveCollege, isPending: isUnsaving } = useUnsaveCollege()
  const isCollegeSaved = isSaved(college.id)
  const savedRecordId = getSavedId(college.id)
  const isActionPending = isSaving || isUnsaving

  const { addCollege, removeCollege, isInCompare, canAdd } = useCompareStore()
  const inCompare = isInCompare(college.id)

  function handleSaveClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error("Please log in to save colleges", {
        action: {
          label: "Log In",
          onClick: () => router.push("/login"),
        },
      })
      return
    }

    if (isCollegeSaved && savedRecordId) {
      unsaveCollege(savedRecordId)
    } else {
      saveCollege(college.id)
    }
  }

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
        <div className="h-48 relative bg-gray-100">
          {college.imageUrl ? (
            <>
              <Image
                src={college.imageUrl}
                alt={college.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center relative z-0">
              <span className="text-6xl font-bold text-blue-300">
                {college.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Badges on top of the image */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            <Badge
              variant={typeBadgeVariant[college.type] || "default"}
              size="sm"
            >
              {college.slug.startsWith("iit-") ? "IIT" : college.slug.match(/^(nit-|mnit-|mnnit-|vnit-|svnit-)/) ? "NIT" : college.type.replace(/_/g, " ")}
            </Badge>
            {college.nirfRank && (
              <Badge variant="default" size="sm" className="bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200">
                <Award className="h-3 w-3 text-blue-600" />
                NIRF #{college.nirfRank}
              </Badge>
            )}
          </div>
          {/* Details below the image */}
          <div className="absolute bottom-3 left-3 right-12 z-10">
            <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-md">
              {college.name}
            </h3>
            <p className="text-sm text-gray-200 mt-1 flex items-center gap-1 drop-shadow-md">
              <MapPin className="h-3.5 w-3.5" />
              {college.city}, {college.state}
            </p>
          </div>
        </div>
      </Link>

      {/* Content below the header */}
      <div className="p-4 bg-white relative z-10">
        <div className="flex items-start justify-end gap-2">
          <button
            onClick={handleSaveClick}
            disabled={isActionPending}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 shrink-0",
              isCollegeSaved
                ? "text-blue-600 hover:text-red-500 hover:bg-red-50"
                : "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
              isActionPending && "opacity-50 cursor-not-allowed"
            )}
            title={isCollegeSaved ? "Remove from saved" : "Save college"}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isCollegeSaved ? "currentColor" : "none"}
            />
          </button>
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
