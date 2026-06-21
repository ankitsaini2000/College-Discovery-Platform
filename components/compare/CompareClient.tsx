"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  GitCompare, Plus, X, Star, MapPin, GraduationCap, Trash2, Save, Building2, Calendar,
  Award, BookOpen, TrendingUp, Users, IndianRupee, ExternalLink,
} from "lucide-react"
import { Button, Badge, Skeleton } from "@/components/ui"
import { useCompareStore } from "@/store/compareStore"
import CollegeSearchModal from "./CollegeSearchModal"
import { toast } from "sonner"
import type { CollegeCard } from "@/types"

function formatFees(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString("en-IN")}`
}

function formatLPA(n: number) {
  const lpa = n / 100000
  return `${lpa % 1 === 0 ? lpa : lpa.toFixed(1)} LPA`
}

type CompareData = {
  colleges: (import("@/types").CollegeWithRelations)[]
  comparedAt: string
}

export default function CompareClient() {
  const { colleges: storedColleges, removeCollege, clearAll, addCollege } = useCompareStore()
  const { data: session } = useSession()
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const slugs = storedColleges.map((c) => c.slug).join(",")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["compare", slugs],
    queryFn: async () => {
      if (!slugs) return null
      const res = await fetch(`/api/compare?ids=${slugs}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json() as Promise<{ data: CompareData }>
    },
    enabled: storedColleges.length >= 2,
  })

  const colleges = data?.data?.colleges || []
  const count = storedColleges.length

  async function handleSaveComparison() {
    if (!session) {
      router.push("/login")
      return
    }
    setSaving(true)
    try {
      const ids = colleges.map((c) => c.id)
      const res = await fetch("/api/saved/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeAId: ids[0],
          collegeBId: ids[1],
          collegeCId: ids[2],
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Comparison saved!")
    } catch {
      toast.error("Failed to save comparison")
    } finally {
      setSaving(false)
    }
  }

  if (count === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <GitCompare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No colleges selected for comparison</h2>
          <p className="text-gray-500 mb-6">Search and add colleges to start comparing</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add College
          </Button>
        </div>
        <CollegeSearchModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSelect={(c) => { addCollege(c); setShowAddModal(false) }}
          excludeIds={storedColleges.map((c) => c.id)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-start gap-4 mb-6">
        {storedColleges.map((college) => (
          <div
            key={college.id}
            className="bg-white border border-gray-200 rounded-xl p-4 relative flex-1 min-w-[200px] max-w-sm"
          >
            <button
              onClick={() => removeCollege(college.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <Badge variant={college.type === "GOVERNMENT" ? "success" : "info"} size="sm">
              {college.type.replace(/_/g, " ")}
            </Badge>
            <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{college.name}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {college.city}, {college.state}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{college.rating?.toFixed(1)}</span>
            </div>
            <Link
              href={`/colleges/${college.slug}`}
              className="text-xs text-blue-600 hover:underline mt-2 inline-block"
            >
              View Details &rarr;
            </Link>
          </div>
        ))}

        {count < 3 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 min-w-[200px] flex-1 h-full min-h-[160px] cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">Add College</span>
          </button>
        )}
      </div>

      <CollegeSearchModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={(c) => { addCollege(c); setShowAddModal(false) }}
        excludeIds={storedColleges.map((c) => c.id)}
      />

      {isLoading && (
        <div className="space-y-3 mt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <div className="text-center py-10 text-gray-500">Failed to load comparison data</div>
      )}

      {colleges.length >= 2 && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[600px]">

              <SectionHeader label="Basic Information" />
              <CompareRow
                label="Annual Fees"
                values={colleges.map((c) => {
                  const best = Math.min(...colleges.filter(Boolean).map((x) => x.fees || Infinity))
                  return { value: c.fees ? formatFees(c.fees) : "N/A", best: c.fees === best && c.fees != null }
                })}
              />
              <CompareRow
                label="College Type"
                values={colleges.map((c) => ({
                  value: <Badge variant={c.type === "GOVERNMENT" ? "success" : "info"} size="sm">{c.type.replace(/_/g, " ")}</Badge>,
                  best: false,
                }))}
              />
              <CompareRow
                label="Established"
                values={colleges.map((c) => ({ value: c.established ? String(c.established) : "N/A", best: false }))}
              />
              <CompareRow
                label="Accreditation"
                values={colleges.map((c) => ({ value: c.accreditation || "N/A", best: false }))}
              />
              <CompareRow
                label="Location"
                values={colleges.map((c) => ({ value: `${c.city}, ${c.state}`, best: false }))}
              />

              <SectionHeader label="Academics" />
              <CompareRow
                label="Courses Offered"
                values={colleges.map((c) => ({
                  value: String(c.courses?.length || 0),
                  best: Math.max(...colleges.map((x) => x.courses?.length || 0)) === (c.courses?.length || 0),
                }))}
              />
              <CompareRow
                label="Exams Accepted"
                values={colleges.map((c) => ({
                  value: c.examAccepted?.length ? (
                    <div className="flex flex-wrap justify-center gap-1">
                      {c.examAccepted.slice(0, 3).map((e) => (
                        <Badge key={e} variant="info" size="sm">{e.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  ) : "N/A",
                  best: false,
                }))}
              />

              <SectionHeader label="Placements" />
              <PlacementRow label="Average Package" colleges={colleges} field="averagePackage" />
              <PlacementRow label="Highest Package" colleges={colleges} field="highestPackage" />
              <CompareRow
                label="Placement Rate"
                values={colleges.map((c) => {
                  const p = c.placements?.[0]
                  const all = colleges.map((x) => x.placements?.[0]?.placementRate || 0)
                  const best = Math.max(...all)
                  return { value: p?.placementRate ? `${p.placementRate}%` : "N/A", best: p?.placementRate === best && best > 0 }
                })}
              />
              <CompareRow
                label="Top Recruiters"
                values={colleges.map((c) => {
                  const recruiters = c.placements?.[0]?.topRecruiters
                  return {
                    value: recruiters?.length ? recruiters.slice(0, 3).join(", ") : "N/A",
                    best: false,
                  }
                })}
              />

              <SectionHeader label="Student Reviews" />
              <CompareRow
                label="Overall Rating"
                values={colleges.map((c) => {
                  const all = colleges.map((x) => x.rating || 0)
                  const best = Math.max(...all)
                  return {
                    value: (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{c.rating?.toFixed(1) || "0.0"}</span>
                      </div>
                    ),
                    best: (c.rating || 0) === best && best > 0,
                  }
                })}
              />
              <CompareRow
                label="Total Reviews"
                values={colleges.map((c) => {
                  const all = colleges.map((x) => x._count?.reviews || 0)
                  const best = Math.max(...all)
                  return { value: String(c._count?.reviews || 0), best: (c._count?.reviews || 0) === best && best > 0 }
                })}
              />
            </table>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button variant="primary" onClick={handleSaveComparison} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save This Comparison"}
            </Button>
            <Button variant="ghost" onClick={clearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={4} className="bg-gray-50 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-200">
        {label}
      </td>
    </tr>
  )
}

function CompareRow({
  label,
  values,
}: {
  label: string
  values: { value: React.ReactNode; best: boolean }[]
}) {
  return (
    <tr className="border-t border-gray-100 even:bg-gray-50/50">
      <td className="px-6 py-4 text-sm font-medium text-gray-700 bg-gray-50/80 w-48 min-w-48 sticky left-0">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className={`px-6 py-4 text-sm text-center ${v.best ? "text-green-600 font-semibold" : "text-gray-900"}`}>
          {v.value}
        </td>
      ))}
    </tr>
  )
}

function PlacementRow({
  label,
  colleges,
  field,
}: {
  label: string
  colleges: any[]
  field: keyof import("@prisma/client").Placement
}) {
  const allValues = colleges.map((c) => {
    const p = c.placements?.[0]
    return p ? (p[field] as number) || 0 : 0
  })
  const best = Math.max(...allValues)

  return (
    <tr className="border-t border-gray-100 even:bg-gray-50/50">
      <td className="px-6 py-4 text-sm font-medium text-gray-700 bg-gray-50/80 w-48 min-w-48 sticky left-0">
        {label}
      </td>
      {colleges.map((c, i) => {
        const p = c.placements?.[0]
        const val = p ? (p[field] as number) : null
        const display = val ? formatLPA(val) : "N/A"
        return (
          <td key={i} className={`px-6 py-4 text-sm text-center ${val === best && best > 0 ? "text-green-600 font-semibold" : "text-gray-900"}`}>
            {display}
          </td>
        )
      })}
    </tr>
  )
}
