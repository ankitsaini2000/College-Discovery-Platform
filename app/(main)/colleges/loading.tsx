import { SkeletonCollegeGrid } from "@/components/ui/Skeleton"

export default function CollegesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-72" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-72 shrink-0">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <SkeletonCollegeGrid count={9} />
          </div>
        </div>
      </div>
    </div>
  )
}
