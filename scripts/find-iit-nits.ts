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
const nameIdx = hdrs.indexOf("name")

const iitNits: string[] = []
for (let i = 1; i < lines.length; i++) {
  const vals = parseCSVLine(lines[i])
  const name = (vals[nameIdx] || "").trim()
  if (/^(Indian Institute of Technology|IIT\b)/i.test(name) || /^NIT\b/i.test(name) || /^National Institute of Technology/i.test(name)) {
    iitNits.push(`${i}: ${name}`)
  }
}
console.log(`Found ${iitNits.length} IITs/NITs:`)
iitNits.forEach(n => console.log(`  ${n}`))
