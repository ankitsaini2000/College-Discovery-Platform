"use client"

import { useState } from "react"
import type { CollegeWithRelations } from "@/types"
import OverviewTab from "./tabs/OverviewTab"
import CoursesTab from "./tabs/CoursesTab"
import PlacementsTab from "./tabs/PlacementsTab"
import ReviewsTab from "./tabs/ReviewsTab"

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "placements", label: "Placements" },
  { id: "reviews", label: "Reviews" },
] as const

type TabId = (typeof tabs)[number]["id"]

export default function CollegeDetailClient({
  college,
  currentUserId,
}: {
  college: CollegeWithRelations
  currentUserId: string | null
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  return (
    <div>
      <div className="flex border-b border-gray-200 bg-white sticky top-16 z-40 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
        {tabs.map((tab) => {
          let label = tab.label
          if (tab.id === "courses") label += ` (${college.courses.length})`
          if (tab.id === "reviews") label += ` (${college._count?.reviews ?? 0})`

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {activeTab === "overview" && <OverviewTab college={college} />}
        {activeTab === "courses" && <CoursesTab courses={college.courses} />}
        {activeTab === "placements" && <PlacementsTab placements={college.placements} />}
        {activeTab === "reviews" && (
          <ReviewsTab
            reviews={college.reviews}
            collegeId={college.id}
            collegeSlug={college.slug}
            currentUserId={currentUserId}
            totalReviews={college._count?.reviews ?? 0}
            initialRating={college.rating}
          />
        )}
      </div>
    </div>
  )
}
