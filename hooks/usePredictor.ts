import { useQuery } from "@tanstack/react-query"
import type { PredictorResponse, PredictorInput } from "@/types"

export const predictorKeys = {
  all: ["predictor"] as const,
  result: (input: PredictorInput) =>
    [...predictorKeys.all, input] as const,
}

export function usePredictor(
  input: PredictorInput | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: predictorKeys.result(input!),
    queryFn: async () => {
      if (!input) throw new Error("No input provided")

      const params = new URLSearchParams({
        exam: input.exam,
        rank: input.rank.toString(),
        category: input.category,
        year: input.year.toString(),
      })

      const res = await fetch(`/api/predict?${params}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Prediction failed")
      }
      const json = await res.json()
      return json.data as PredictorResponse
    },
    enabled: enabled && !!input,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
