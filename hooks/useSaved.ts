import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import type { SavedCollegeWithCollege, SavedComparisonWithColleges } from "@/types"

export const savedKeys = {
  all: ["saved"] as const,
  colleges: () => [...savedKeys.all, "colleges"] as const,
  comparisons: () => [...savedKeys.all, "comparisons"] as const,
}

export function useSavedColleges() {
  return useQuery({
    queryKey: savedKeys.colleges(),
    queryFn: async () => {
      const res = await fetch("/api/saved/colleges")
      if (res.status === 401) return { data: [] }
      if (!res.ok) throw new Error("Failed to fetch saved colleges")
      return res.json() as Promise<{ data: SavedCollegeWithCollege[] }>
    },
    staleTime: 1 * 60 * 1000,
  })
}

export function useSaveCollege() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (collegeId: string) => {
      const res = await fetch("/api/saved/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId }),
      })
      if (res.status === 401) throw new Error("Please log in to save colleges")
      if (!res.ok) throw new Error("Failed to save college")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.colleges() })
      toast.success("College saved to your list")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUnsaveCollege() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (savedId: string) => {
      const res = await fetch(`/api/saved/colleges/${savedId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to remove college")
      return res.json()
    },
    onMutate: async (savedId) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.colleges() })

      const previous = queryClient.getQueryData(savedKeys.colleges())

      queryClient.setQueryData(savedKeys.colleges(), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((s: any) => s.id !== savedId),
        }
      })

      return { previous }
    },
    onError: (error, savedId, context) => {
      queryClient.setQueryData(savedKeys.colleges(), context?.previous)
      toast.error("Failed to remove college")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.colleges() })
      toast.success("College removed from saved list")
    },
  })
}

export function useSavedComparisons() {
  return useQuery({
    queryKey: savedKeys.comparisons(),
    queryFn: async () => {
      const res = await fetch("/api/saved/comparisons")
      if (res.status === 401) return { data: [] }
      if (!res.ok) throw new Error("Failed to fetch saved comparisons")
      return res.json() as Promise<{ data: SavedComparisonWithColleges[] }>
    },
    staleTime: 1 * 60 * 1000,
  })
}

export function useSaveComparison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      collegeAId: string
      collegeBId: string
      collegeCId?: string
    }) => {
      const res = await fetch("/api/saved/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.status === 401) throw new Error("Please log in to save comparisons")
      if (!res.ok) throw new Error("Failed to save comparison")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.comparisons() })
      toast.success("Comparison saved to your dashboard")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteComparison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (comparisonId: string) => {
      const res = await fetch(`/api/saved/comparisons/${comparisonId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete comparison")
      return res.json()
    },
    onMutate: async (comparisonId) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.comparisons() })
      const previous = queryClient.getQueryData(savedKeys.comparisons())
      queryClient.setQueryData(savedKeys.comparisons(), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((c: any) => c.id !== comparisonId),
        }
      })
      return { previous }
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(savedKeys.comparisons(), context?.previous)
      toast.error("Failed to delete comparison")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.comparisons() })
      toast.success("Comparison deleted")
    },
  })
}
