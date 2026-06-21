"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Bookmark, GitCompare, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui"
import { useSaveCollege, useUnsaveCollege } from "@/hooks/useSaved"
import { useCompareStore } from "@/store/compareStore"
import { useSavedIds } from "@/hooks/useSavedIds"
import { toast } from "sonner"
import type { CollegeCard } from "@/types"

interface CollegeActionsProps {
  college: CollegeCard
  website?: string | null
}

export default function CollegeActions({ college, website }: CollegeActionsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const saveCollege = useSaveCollege()
  const unsaveCollege = useUnsaveCollege()
  const { isSaved, getSavedId } = useSavedIds()
  const { addCollege, removeCollege, isInCompare, canAdd } = useCompareStore()

  const saved = isSaved(college.id)
  const inCompare = isInCompare(college.id)

  function handleSave() {
    if (!session) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }
    if (saved) {
      const savedId = getSavedId(college.id)
      if (savedId) unsaveCollege.mutate(savedId)
    } else {
      saveCollege.mutate(college.id)
    }
  }

  function handleCompare() {
    if (inCompare) {
      removeCollege(college.id)
      toast.info("Removed from comparison")
    } else if (canAdd()) {
      addCollege(college as CollegeCard)
      toast.success("Added to comparison")
    } else {
      toast.error("Maximum 3 colleges can be compared at once")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
      <Button variant={saved ? "primary" : "outline"} onClick={handleSave}>
        <Bookmark className="h-4 w-4" />
        {saved ? "Saved" : "Save College"}
      </Button>
      <Button variant={inCompare ? "danger" : "secondary"} onClick={handleCompare}>
        <GitCompare className="h-4 w-4" />
        {inCompare ? "✓ In Comparison" : "+ Compare"}
      </Button>
      {website && (
        <a href={website} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost">
            <ExternalLink className="h-4 w-4" />
            Visit Website
          </Button>
        </a>
      )}
    </div>
  )
}
