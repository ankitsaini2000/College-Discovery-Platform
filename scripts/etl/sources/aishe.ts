import { readFileSync } from "fs"
import { join } from "path"
import type { ETLSource, ETLResult, RawCollege } from "../types"

interface AISHERecord {
  aishe_code: string
  name: string
  state: string
  district: string
}

function deriveType(aisheCode: string): "GOVERNMENT" | "PRIVATE" | "DEEMED" | "AUTONOMOUS" {
  // U-* = University, C-* = College, S-* = Standalone, R-* = R&D
  // Default to GOVERNMENT; AICTE source provides proper type mapping
  return "GOVERNMENT"
}

export class AISHESource implements ETLSource {
  name = "AISHE (All India Survey on Higher Education)"

  async fetch(): Promise<ETLResult> {
    const dataPath = join(__dirname, "..", "..", "..", "node_modules", "aishe-institutions-list", "data", "institutions.json")
    console.log(`[AISHE] Loading institutions from ${dataPath}...`)

    const raw: AISHERecord[] = JSON.parse(readFileSync(dataPath, "utf-8"))
    console.log(`[AISHE] Loaded ${raw.length} institutions`)

    // Dedup by AISHE code — keep the entry with longer name (more complete)
    const codeMap = new Map<string, AISHERecord>()
    for (const r of raw) {
      const existing = codeMap.get(r.aishe_code)
      if (!existing || r.name.length > existing.name.length) {
        codeMap.set(r.aishe_code, r)
      }
    }

    const deduped = Array.from(codeMap.values())
    const dupRemoved = raw.length - deduped.length
    if (dupRemoved > 0) console.log(`[AISHE] Removed ${dupRemoved} duplicates by AISHE code`)

    const colleges: RawCollege[] = deduped.map((r): RawCollege => ({
      name: r.name.trim(),
      location: `${r.district || ""}, ${r.state}`.replace(/^, /, ""),
      city: r.district || r.state.split(",")[0]?.trim() || "Unknown",
      state: r.state.trim(),
      country: "India",
      fees: 0,
      overview: `${r.name} is a higher education institution in ${r.district || r.state}, ${r.state}. AISHE code: ${r.aishe_code}.`,
      established: null,
      type: deriveType(r.aishe_code),
      status: "ACTIVE",
      accreditation: null,
      website: null,
      email: null,
      phone: null,
      examAccepted: [],
      source: "AISHE",
      sourceId: r.aishe_code,
      nirfRank: null,
    }))

    return { colleges, courses: [], placements: [], cutoffs: [] }
  }
}
