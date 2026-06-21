import { useMemo } from "react"
import { useSavedColleges } from "./useSaved"

export function useSavedIds() {
  const { data } = useSavedColleges()

  const savedMap = useMemo(() => {
    const map = new Map<string, string>()
    data?.data?.forEach((saved) => {
      map.set(saved.collegeId, saved.id)
    })
    return map
  }, [data])

  return {
    savedMap,
    isSaved: (collegeId: string) => savedMap.has(collegeId),
    getSavedId: (collegeId: string) => savedMap.get(collegeId),
  }
}
