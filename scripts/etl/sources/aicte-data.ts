import type { ETLSource, ETLResult, RawCollege, RawCourse } from "../types"
import type { CollegeType } from "@prisma/client"

const AICTE_DATA_URL =
  "https://raw.githubusercontent.com/anburocky3/indian-colleges-data/main/data/institutions-with-programmes.json"

interface AICTEProgramme {
  programme?: string
  level?: string
  course?: string
  intake?: string
}

interface AICTEDetailRecord {
  aicte_id?: string
  institute_name?: string
  address?: string
  district?: string
  institution_type?: string
  women?: string
  minority?: string
  state?: string
  university?: string
  programmes?: AICTEProgramme[]
}

function mapCollegeType(instType: string | undefined): CollegeType {
  switch (instType) {
    case "Government":
    case "Govt aided":
    case "Central University":
    case "State Government University":
      return "GOVERNMENT"
    case "Private-Self Financing":
    case "State Private University":
      return "PRIVATE"
    case "Deemed to be University(Pvt)":
    case "Deemed to be University(Govt)":
      return "DEEMED"
    default:
      return "GOVERNMENT"
  }
}

function mapLevelToDuration(level: string | undefined): string {
  switch (level) {
    case "DIPLOMA": return "3 years"
    case "UNDER GRADUATE": return "4 years"
    case "POST GRADUATE": return "2 years"
    case "POST GRADUATE DIPLOMA": return "1 year"
    case "Integrated": return "5 years"
    case "POST DIPLOMA": return "1 year"
    default: return "3 years"
  }
}

function mapLevelToDegree(level: string | undefined): string {
  switch (level) {
    case "DIPLOMA": return "Diploma"
    case "UNDER GRADUATE": return "Bachelor's"
    case "POST GRADUATE": return "Master's"
    case "POST GRADUATE DIPLOMA": return "PG Diploma"
    case "Integrated": return "Integrated"
    case "POST DIPLOMA": return "Advanced Diploma"
    default: return level || "Certificate"
  }
}

export class AICTEDetailSource implements ETLSource {
  name = "AICTE Details (anburocky3 Github)"

  async fetch(): Promise<ETLResult> {
    console.log("[AICTEDetail] Fetching AICTE institution details...")

    try {
      console.log(`[AICTEDetail] Downloading from ${AICTE_DATA_URL}...`)
      const res = await fetch(AICTE_DATA_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

      const raw: AICTEDetailRecord[] = await res.json()
      console.log(`[AICTEDetail] Downloaded ${raw.length} institutions with programmes`)

      const colleges: RawCollege[] = []
      const courses: RawCourse[] = []

      for (let i = 0; i < raw.length; i++) {
        const r = raw[i]
        if (!r.institute_name || !r.state) continue

        const city = r.district || r.state.split(",")[0]?.trim() || "Unknown"
        const instType = r.institution_type?.trim()
        const collegeType = mapCollegeType(instType)

        colleges.push({
          name: r.institute_name.trim(),
          location: `${r.address || r.district || ""}, ${r.state}`.replace(/^, /, ""),
          city,
          state: r.state.trim(),
          country: "India",
          fees: 0,
          overview: `${r.institute_name} is an AICTE-approved ${collegeType.toLowerCase()} institution in ${r.district || ""}, ${r.state}${
            r.university && r.university !== "NOT APPLICABLE" && r.university !== "None"
              ? `. Affiliated to ${r.university}.`
              : "."
          }`,
          established: null,
          type: collegeType,
          accreditation: null,
          website: null,
          email: null,
          phone: null,
          examAccepted: [],
          source: "AICTE",
          sourceId: `aicte-data-${i}`,
          nirfRank: null,
        })

        // Parse programmes into courses
        if (r.programmes && r.programmes.length > 0) {
          for (const prog of r.programmes) {
            if (!prog.course) continue
            const intake = prog.intake ? parseInt(prog.intake, 10) : null
            courses.push({
              collegeName: r.institute_name.trim(),
              collegeCity: city,
              name: prog.course.trim(),
              duration: mapLevelToDuration(prog.level),
              fees: 0,
              seats: intake && !isNaN(intake) ? intake : null,
              degree: mapLevelToDegree(prog.level),
            })
          }
        }
      }

      console.log(`[AICTEDetail] Mapped ${colleges.length} colleges, ${courses.length} courses`)
      return { colleges, courses, placements: [], cutoffs: [] }
    } catch (err) {
      console.error(`[AICTEDetail] Fetch failed:`, err instanceof Error ? err.message : err)
      return { colleges: [], courses: [], placements: [], cutoffs: [] }
    }
  }
}
