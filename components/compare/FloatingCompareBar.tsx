"use client"

import { useCompareStore } from "@/store/compareStore"
import { useRouter } from "next/navigation"
import { X, Columns2, ArrowRight, Trash2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export default function FloatingCompareBar() {
  const { colleges, removeCollege, clearAll, getCount, canAdd } = useCompareStore()
  const router = useRouter()
  const count = getCount()

  if (count === 0) return null

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Columns2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Compare ({count}/3)</span>
            </div>

            <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0 scrollbar-hide">
              {colleges.map((college) => (
                <div
                  key={college.id}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap shrink-0"
                >
                  <span>{college.name.length > 20 ? college.name.slice(0, 20) + "..." : college.name}</span>
                  <button
                    onClick={() => removeCollege(college.id)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {canAdd() && (
                <div className="border-2 border-dashed border-gray-300 rounded-full px-3 py-1.5 text-sm text-gray-400 whitespace-nowrap shrink-0">
                  + Add college
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={clearAll}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {count === 1 && (
                <span className="text-xs text-gray-400 whitespace-nowrap">Add 1 more to compare</span>
              )}

              <button
                onClick={() => router.push("/compare")}
                disabled={count < 2}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Compare Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
