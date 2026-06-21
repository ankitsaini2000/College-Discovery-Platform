"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
