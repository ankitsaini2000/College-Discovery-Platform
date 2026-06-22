import type { Metadata } from "next"
import PredictorClient from "@/components/predict/PredictorClient"

export const metadata: Metadata = {
  title: "JEE Rank Predictor | IIT & NIT College Predictor",
  description: "Enter your JEE Main or JEE Advanced rank to predict which IITs and NITs you can get into. Branch-wise results with real JoSAA cutoff data.",
}

export default function PredictPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <span>🎯</span>
            <span>JEE Rank Predictor — Based on JoSAA Cutoffs</span>
          </div>
          <h1 className="text-4xl font-bold text-white">
            Predict Your IIT or NIT
          </h1>
          <p className="text-blue-100 mt-3 text-lg max-w-2xl mx-auto">
            Enter your JEE Main or JEE Advanced rank to find which IITs & NITs you can get into — branch-wise, category-wise
          </p>
        </div>
      </div>
      <PredictorClient />
    </div>
  )
}
