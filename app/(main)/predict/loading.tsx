export default function PredictLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-8 bg-white/20 rounded-full w-64 mx-auto mb-4" />
          <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-3" />
          <div className="h-5 bg-white/20 rounded w-80 mx-auto" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  )
}
