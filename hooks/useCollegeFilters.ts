"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

export type FilterKey =
  | "search"
  | "state"
  | "type"
  | "exam"
  | "minFees"
  | "maxFees"
  | "minRating"
  | "sortBy"
  | "sortOrder"
  | "page"
  | "instituteType"

export function useCollegeFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function getFilter(key: FilterKey): string | null {
    return searchParams.get(key)
  }

  function getAllFilters(): Record<string, string> {
    const filters: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      filters[key] = value
    })
    return filters
  }

  const setFilter = useCallback(
    (key: FilterKey, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      if (key !== "page") {
        params.set("page", "1")
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  const setFilters = useCallback(
    (updates: Partial<Record<FilterKey, string | null>>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      params.set("page", "1")

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }, [pathname, router])

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page" && key !== "sortBy" && key !== "sortOrder"
  )

  const queryString = searchParams.toString()

  return {
    getFilter,
    getAllFilters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,
    queryString,
    isPending,
  }
}
