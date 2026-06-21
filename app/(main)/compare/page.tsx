import type { Metadata } from "next"
import CompareClient from "@/components/compare/CompareClient"

export const metadata: Metadata = {
  title: "Compare Colleges",
  description: "Compare colleges side by side on fees, placements, ratings and more",
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Compare Colleges
          </h1>
          <p className="text-gray-500 mt-2">
            Select 2 to 3 colleges to compare side by side
          </p>
        </div>
      </div>
      <CompareClient />
    </div>
  )
}
