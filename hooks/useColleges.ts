import { useQuery } from "@tanstack/react-query"
import type { CollegeCard, CollegeDetail, PaginatedResponse } from "@/types"

export const collegeKeys = {
  all: ["colleges"] as const,
  lists: () => [...collegeKeys.all, "list"] as const,
  list: (filters: string) => [...collegeKeys.lists(), filters] as const,
  details: () => [...collegeKeys.all, "detail"] as const,
  detail: (slug: string) => [...collegeKeys.details(), slug] as const,
  states: () => [...collegeKeys.all, "states"] as const,
  compare: (ids: string) => [...collegeKeys.all, "compare", ids] as const,
}

export function useColleges(searchParamsString: string) {
  return useQuery({
    queryKey: collegeKeys.list(searchParamsString),
    queryFn: async () => {
      const res = await fetch(`/api/colleges?${searchParamsString}`)
      if (!res.ok) throw new Error("Failed to fetch colleges")
      return res.json() as Promise<PaginatedResponse<CollegeCard>>
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}

export function useCollegeDetail(slug: string) {
  return useQuery({
    queryKey: collegeKeys.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/colleges/${slug}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error("College not found")
        throw new Error("Failed to fetch college")
      }
      const json = await res.json()
      return json.data as CollegeDetail
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message === "College not found") return false
      return failureCount < 2
    },
  })
}

export function useStates() {
  return useQuery({
    queryKey: collegeKeys.states(),
    queryFn: async () => {
      const res = await fetch("/api/colleges/states")
      if (!res.ok) throw new Error("Failed to fetch states")
      const json = await res.json()
      return json.data as string[]
    },
    staleTime: 30 * 60 * 1000,
  })
}

export function useCompare(ids: string[]) {
  const idsString = ids.join(",")
  return useQuery({
    queryKey: collegeKeys.compare(idsString),
    queryFn: async () => {
      const res = await fetch(`/api/compare?ids=${idsString}`)
      if (!res.ok) throw new Error("Failed to fetch comparison")
      const json = await res.json()
      return json.data
    },
    enabled: ids.length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}
