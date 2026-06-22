import { PrismaClient, CollegeType, ExamType, Category } from "@prisma/client"
import bcrypt from "bcryptjs"
import { readFileSync } from "fs"

const prisma = new PrismaClient()
const CSV = "C:\\Users\\ankit\\Desktop\\scraping\\collegedunia_data\\college_full.csv"

function parseCSVLine(line: string): string[] {
  const result: string[] = []; let cur = "", inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQ = !inQ }
    else if (ch === "," && !inQ) { result.push(cur); cur = "" }
    else { cur += ch }
  }
  result.push(cur)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i])
    if (vals.length >= headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((h, j) => { row[h] = (vals[j] || "").trim() })
      rows.push(row)
    }
  }
  return rows
}

/** Parse JS-object-literal like [{name: B.Sc, fee: INR 10k}, ...] */
function parseObjectLiteralArray(text: string): Record<string, string>[] {
  const results: Record<string, string>[] = []
  // Remove outer brackets
  let s = text.trim()
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1).trim()
  if (!s) return results

  // Split by top-level commas (not inside braces)
  const parts: string[] = []
  let depth = 0, start = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") depth++
    else if (s[i] === "}") depth--
    else if (s[i] === "," && depth === 0) {
      parts.push(s.slice(start, i))
      start = i + 1
    }
  }
  if (start < s.length) parts.push(s.slice(start))

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed || trimmed === "}" || trimmed === "{}") continue
    const inner = trimmed.startsWith("{") && trimmed.endsWith("}") ? trimmed.slice(1, -1) : trimmed
    const fields = parseObjectLiteral(inner)
    if (Object.keys(fields).length > 0) results.push(fields)
  }
  return results
}

function parseObjectLiteral(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  // Match key: value pairs, where value may contain nested braces
  const parts: string[] = []
  let depth = 0, start = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{" || text[i] === "(") depth++
    else if (text[i] === "}" || text[i] === ")") depth--
    else if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
  }
  if (start < text.length) parts.push(text.slice(start))

  for (const part of parts) {
    const colonIdx = part.indexOf(":")
    if (colonIdx === -1) continue
    const key = part.slice(0, colonIdx).replace(/[*\n\r]/g, "").trim()
    const val = part.slice(colonIdx + 1).trim()
    if (key && val) result[key] = val
  }
  return result
}

function parseFee(val: string): number {
  if (!val) return 0
  // Remove currency symbols and commas
  let s = val.replace(/[,₹RsINRinr\s]+/g, "").trim()
  // Handle L / Lakh / Lakhs
  const lMatch = s.match(/^(\d+\.?\d*)l/i) || s.match(/^(\d+\.?\d*)lakh/i)
  if (lMatch) return Math.round(parseFloat(lMatch[1]) * 100000)
  // Handle plain numbers
  const nMatch = s.match(/^(\d+\.?\d*)/)
  if (nMatch) return Math.round(parseFloat(nMatch[1]))
  return 0
}

/** Extract established year from about text or established column */
function extractYear(est: string, about: string): number | null {
  const cleaned = est.replace(/[^0-9]/g, "")
  if (cleaned && cleaned.length === 4) return parseInt(cleaned)
  const m = about.match(/Estd\s*(\d{4})/i)
  if (m) return parseInt(m[1])
  return null
}

/** Extract NAAC grade */
function extractNAAC(acc: string, about: string): string | null {
  // Try accreditation column
  if (acc && acc !== "NAAC Grade") {
    const m = acc.match(/([A-Z](\+*))\s*[\d.]*/)
    if (m) return m[1]
    // Also "MCI" or other accreditations
    if (acc.match(/^(MCI|NBA|ABET|AICTE|UGC)$/i)) return acc
  }
  // Try about text
  const m2 = about.match(/NAAC\s+Grade\s+([A-Z](\+*))/i)
  if (m2) return m2[1]
  return null
}

function mapType(t: string): CollegeType {
  const s = (t || "").toUpperCase()
  if (s.includes("GOVT") || s.includes("GOVERNMENT")) return "GOVERNMENT"
  if (s.includes("DEEMED")) return "DEEMED"
  if (s.includes("AUTONOMOUS")) return "AUTONOMOUS"
  return "PRIVATE"
}

function parseExam(exam: string): ExamType | null {
  const e = exam.toUpperCase().replace(/[\s-]/g, "_")
  if (e.includes("JEE_ADV") || e.includes("JEE ADVANCED")) return "JEE_ADVANCED"
  if (e.includes("JEE_MAIN") || e.includes("JEEMAIN") || e === "JEE") return "JEE_MAIN"
  if (e.includes("NEET")) return "NEET"
  if (e.includes("CAT")) return "CAT"
  if (e.includes("GATE")) return "GATE"
  if (e.includes("XAT")) return "XAT"
  if (e.includes("CLAT")) return "CLAT"
  if (e.includes("CET") || e.includes("STATE")) return "STATE_CET"
  return null
}

function toSlug(name: string, id: string, idx: number): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
  return base + "-" + (id || idx)
}

function isHeaderRow(obj: Record<string, string>): boolean {
  const vals = Object.values(obj).map(v => v.toLowerCase())
  const headerTerms = ["courses", "first year fees", "total fees", "course detail", "duration", "eligibility",
    "selection criteria", "course details", "course name", "1st year fees", "tuition fees", "specialisation",
    "specializations", "course fee", "1st year fee", "total tuition fees", "programs", "program",
    "first semester tuition fees", "seats", "intake"]
  return vals.some(v => headerTerms.includes(v))
}

/** Try to extract course name from a possibly noisy value */
function cleanCourseName(val: string): string | null {
  const v = val.replace(/[*\n\r]/g, "").trim()
  if (!v) return null
  // Skip if it looks like a fee value
  if (/^(INR|₹|Rs)/i.test(v)) return null
  if (/^[\d.]+(\s*L|lakh|k)?$/i.test(v)) return null
  if (/^\d{4}$/.test(v)) return null // just a year
  if (v.length < 2) return null
  // Remove markdown links [text](url)
  const cleaned = v.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim()
  if (cleaned.length < 2) return null
  return cleaned
}

function parseFeeRange(val: string): number {
  if (!val) return 0
  // Handle "INR 1.77 L" or "₹ 4.77 Lakh"
  const m = val.match(/(\d+\.?\d*)\s*(L|lakh|k)/i)
  if (m) return parseFee(m[0])
  // Handle "INR 96,845"
  return parseFee(val)
}

function countTokens(str: string): number {
  return str.split(/\s+/).filter(s => s.length > 0).length
}

async function main() {
  console.log("=== CLEAR DB & IMPORT CSV ===\n")

  // Clear all existing data
  console.log("Clearing database...")
  await prisma.savedComparison.deleteMany()
  await prisma.savedCollege.deleteMany()
  await prisma.review.deleteMany()
  await prisma.cutoffRank.deleteMany()
  await prisma.placement.deleteMany()
  await prisma.course.deleteMany()
  await prisma.college.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  console.log("Done.\n")

  // Create seed users
  console.log("Creating users...")
  const password = await bcrypt.hash("password123", 12)
  await prisma.user.createMany({
    data: [
      { id: "user-test-1", email: "test@example.com", name: "Test User", password },
      { id: "user-test-2", email: "demo@example.com", name: "Demo User", password },
    ],
  })
  console.log("Created 2 users.\n")

  // Read CSV
  console.log("Loading CSV...")
  const raw = readFileSync(CSV, "utf-8")
  const rows = parseCSV(raw)
  console.log(`${rows.length} records loaded.\n`)

  let created = 0, coursesTotal = 0, placementsTotal = 0, cutoffsTotal = 0

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (!r.name) continue

    const slug = toSlug(r.name, String(i), i)
    const collegeType = mapType(r.type || "")
    const rating = parseFloat(r.rating || "") || 0
    const about = r.about || ""

    // Established year
    const established = extractYear(r.established || "", about)

    // NAAC grade / accreditation
    const accreditation = extractNAAC(r.accreditation || "", about)

    // Parse courses_json for course data AND placement salary data
    let minFee = 0
    let courseEntries: { name: string; fees: number }[] = []
    let highestPkg = 0
    let avgPkg = 0

    if (r.courses_json) {
      try {
        const objs = parseObjectLiteralArray(r.courses_json)
        for (const obj of objs) {
          const name = cleanCourseName(obj.name || obj.Name || "")
          if (!name) continue

          // Check if this is placement/salary info
          const nameLower = name.toLowerCase()
          if (nameLower.includes("highest package") || nameLower.includes("highest salary")) {
            const v = obj.firstYearFee || obj.totalFee || ""
            highestPkg = Math.max(highestPkg, parseFee(v))
            continue
          }
          if (nameLower.includes("average package") || nameLower.includes("average salary") || nameLower.includes("median package")) {
            const v = obj.firstYearFee || obj.totalFee || ""
            avgPkg = Math.max(avgPkg, parseFee(v))
            continue
          }
          if (nameLower.includes("median package") || nameLower.includes("median salary")) {
            const v = obj.firstYearFee || obj.totalFee || ""
            if (!avgPkg) avgPkg = parseFee(v)
            continue
          }

          // Skip header rows
          if (isHeaderRow(obj)) continue

          // Skip if name is too generic
          if (nameLower.match(/^(top\s*recruiters|fees|duration|eligibility|selection|specialisation|specialization|application|admission|mode)$/)) continue

          // Parse fee
          let fee = 0
          const fv = obj.totalFee || obj.firstYearFee || obj.fees || obj["Total Fees"] || ""
          fee = parseFee(fv)
          if (fee === 0) {
            // Try fee range
            fee = parseFeeRange(fv)
          }

          if (fee > 0 && (minFee === 0 || fee < minFee)) minFee = fee

          // Only add real course entries (skip noise like dates, links, etc.)
          if (name.length > 2 && !name.match(/^\d+$/) && countTokens(name) <= 15) {
            courseEntries.push({ name, fees: fee })
          }
        }
      } catch { /* silent */ }
    }

    // Use placementRate from CSV if available
    const placementRate = parseFloat(r.placementRate || "") || 0

    // If no salary data from courses_json, try reuse placementRate as a flag
    if (!highestPkg && !avgPkg && placementRate) {
      // Some rows have rates but no salary - we'll create placement with just rate
    }

    // Parse topRecruiters
    const recruiters = r.topRecruiters
      ? r.topRecruiters.split(";").map(s => s.trim()).filter(s => s.length > 1 && !s.match(/^(DDUC|M\.Com|From|Students|Read|Delhi|School|Eco|Particulars|Details|Highest|Various|Companies)$/i))
      : []

    // Create college
    const college = await prisma.college.create({
      data: {
        name: r.name,
        slug,
        location: r.city || "",
        city: r.city || "",
        state: r.state || "",
        country: "India",
        fees: Math.min(minFee || 1000, 50000000),
        rating: rating || 0,
        reviewCount: parseInt(r.reviewCount || "0") || 0,
        imageUrl: r.imageUrl || null,
        overview: about || "",
        established: established || undefined,
        type: collegeType,
        status: "ACTIVE",
        accreditation,
        examAccepted: [],
      },
    })
    created++

    // Create courses (limit to first 8 real courses)
    let coursesCreated = 0
    for (const cd of courseEntries) {
      if (coursesCreated >= 8) break
      if (!cd.name) continue
      const degree = cd.name.toLowerCase().includes("mba") || cd.name.toLowerCase().includes("b.ed")
        || cd.name.toLowerCase().includes("ba") || cd.name.toLowerCase().includes("b.sc")
        || cd.name.toLowerCase().includes("b.tech") || cd.name.toLowerCase().includes("m.tech")
        || cd.name.toLowerCase().includes("b.com") || cd.name.toLowerCase().includes("m.com")
        ? "BACHELORS" : "BACHELORS"
      await prisma.course.create({
        data: { collegeId: college.id, name: cd.name.slice(0, 100), duration: "4 years", fees: Math.min(cd.fees || 0, 50000000), degree },
      }).catch(() => {})
      coursesCreated++
    }
    coursesTotal += coursesCreated

    // Create placement
    if (highestPkg > 0 || avgPkg > 0 || placementRate > 0) {
      await prisma.placement.create({
        data: {
          collegeId: college.id, year: 2024,
          averagePackage: Math.min(avgPkg || highestPkg, 50000000),
          highestPackage: Math.min(highestPkg || avgPkg, 50000000),
          placementRate: placementRate || 0,
          topRecruiters: recruiters && recruiters.length > 0 ? recruiters : [],
        },
      }).catch(() => {})
      placementsTotal++
    }

    // Create cutoffs
    if (r.cutoff_json && r.cutoff_json !== "[]") {
      try {
        const cutoffs = parseObjectLiteralArray(r.cutoff_json)
        for (const ct of cutoffs) {
          const examStr = (ct.exam || ct.Exam || "").trim()
          let exam = parseExam(examStr)
          // Many use "JEE Advanced" as default - try to detect from exam field
          if (!exam) exam = parseExam(examStr)

          const minRank = parseInt(ct.minRank || ct.minrank || "0") || 0
          const maxRank = parseInt(ct.maxRank || ct.maxrank || "0") || 0
          if (!exam || (!minRank && !maxRank)) continue

          await prisma.cutoffRank.create({
            data: {
              collegeId: college.id,
              exam,
              year: 2024,
              category: "GENERAL",
              minRank,
              maxRank,
              course: (ct.course || ct.Course || "").trim() || null,
            },
          }).catch(() => {})
          cutoffsTotal++
        }
      } catch { /* silent */ }
    }

    if ((i + 1) % 100 === 0 || i === rows.length - 1) {
      console.log(`  ${i + 1}/${rows.length} | created:${created} courses:${coursesTotal} placements:${placementsTotal} cutoffs:${cutoffsTotal}`)
    }
  }

  console.log("\n=== FINAL ===")
  console.log(`  Colleges: ${created}`)
  console.log(`  Courses: ${coursesTotal}`)
  console.log(`  Placements: ${placementsTotal}`)
  console.log(`  Cutoffs: ${cutoffsTotal}`)
  console.log(`  Users: 2`)

  await prisma.$disconnect()
}
main().catch(e => { console.error("Fatal:", e); process.exit(1) })
