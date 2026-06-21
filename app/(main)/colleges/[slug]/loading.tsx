export default function CollegeDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-20 mb-4" />
              <div className="h-10 bg-gray-200 rounded w-96 mb-3" />
              <div className="h-5 bg-gray-200 rounded w-48 mb-3" />
              <div className="h-5 bg-gray-200 rounded w-32" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded-lg w-32" />
              <div className="h-10 bg-gray-200 rounded-lg w-28" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-1" />
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  )
}
