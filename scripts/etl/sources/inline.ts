import type { ETLSource, ETLResult, RawCollege } from "../types"
import { builtInColleges, builtInCourses, builtInPlacements, builtInCutoffs } from "../data/colleges"

export class InlineSource implements ETLSource {
  name = "INLINE (Built-in ~70 Indian colleges)"

  async fetch(): Promise<ETLResult> {
    console.log(`[Inline] Loading ${builtInColleges.length} colleges from built-in data...`)
    return {
      colleges: builtInColleges,
      courses: builtInCourses,
      placements: builtInPlacements,
      cutoffs: builtInCutoffs,
    }
  }
}
