"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CollegeCard } from "@/types"

interface CompareStore {
  colleges: CollegeCard[]
  addCollege: (college: CollegeCard) => void
  removeCollege: (collegeId: string) => void
  clearAll: () => void
  isInCompare: (collegeId: string) => boolean
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      colleges: [],

      addCollege: (college) => {
        const { colleges } = get()
        if (colleges.length >= 3) return
        if (colleges.find((c) => c.id === college.id)) return
        set({ colleges: [...colleges, college] })
      },

      removeCollege: (collegeId) => {
        set((state) => ({
          colleges: state.colleges.filter((c) => c.id !== collegeId),
        }))
      },

      clearAll: () => set({ colleges: [] }),

      isInCompare: (collegeId) => {
        return get().colleges.some((c) => c.id === collegeId)
      },
    }),
    {
      name: "compare-store",
    }
  )
)
