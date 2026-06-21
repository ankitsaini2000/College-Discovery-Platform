"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CollegeCard } from "@/types"

const MAX_COMPARE = 3

interface CompareStore {
  colleges: CollegeCard[]
  isOpen: boolean
  addCollege: (college: CollegeCard) => { success: boolean; message: string }
  removeCollege: (collegeId: string) => void
  clearAll: () => void
  isInCompare: (collegeId: string) => boolean
  getCount: () => number
  setIsOpen: (open: boolean) => void
  canAdd: () => boolean
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      colleges: [],
      isOpen: false,

      addCollege: (college) => {
        const { colleges } = get()

        if (colleges.find((c) => c.id === college.id)) {
          return { success: false, message: "College already in comparison" }
        }

        if (colleges.length >= MAX_COMPARE) {
          return { success: false, message: `Maximum ${MAX_COMPARE} colleges can be compared` }
        }

        set({
          colleges: [...colleges, college],
          isOpen: true,
        })

        return { success: true, message: `${college.name} added to comparison` }
      },

      removeCollege: (collegeId) => {
        set((state) => ({
          colleges: state.colleges.filter((c) => c.id !== collegeId),
          isOpen: state.colleges.length > 1,
        }))
      },

      clearAll: () => set({ colleges: [], isOpen: false }),

      isInCompare: (collegeId) => {
        return get().colleges.some((c) => c.id === collegeId)
      },

      getCount: () => get().colleges.length,

      setIsOpen: (open) => set({ isOpen: open }),

      canAdd: () => get().colleges.length < MAX_COMPARE,
    }),
    {
      name: "college-compare",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ colleges: state.colleges }),
    }
  )
)
