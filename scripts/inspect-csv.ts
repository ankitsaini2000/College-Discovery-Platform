import { readFileSync } from "fs"

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

const raw = readFileSync("C:\\Users\\ankit\\Desktop\\scraping\\collegedunia_data\\college_full.csv", "utf-8")
const lines = raw.split("\n").filter(l => l.trim())
const hdrs = parseCSVLine(lines[0]).map(h => h.trim())

// Search for any row with avgPackage or highPackage
for (let i = 1; i < lines.length; i++) {
  const vals = parseCSVLine(lines[i])
  for (let j = 0; j < vals.length; j++) {
    const v = (vals[j] || "").trim()
    if (v.match(/[\d.]+ L/i) || v.match(/INR/i)) {
      console.log(`Row ${i}, col ${j} (${hdrs[j] || "?"}): "${v.slice(0,80)}"`)
    }
  }
}
console.log("Search done")
