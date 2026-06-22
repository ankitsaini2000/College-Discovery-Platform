const fs = require("fs")
const raw = fs.readFileSync("C:\\Users\\ankit\\Desktop\\scraping\\collegedunia_data\\college_full.csv", "utf-8")

function parseCSVLine(line) {
  const result = []; let cur = "", inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQ = !inQ }
    else if (ch === "," && !inQ) { result.push(cur); cur = "" }
    else { cur += ch }
  }
  result.push(cur)
  return result
}
const lines = raw.split("\n").filter(l => l.trim())
const headers = parseCSVLine(lines[0])
const names = []
for (let i = 1; i < lines.length && i < 600; i++) {
  const vals = parseCSVLine(lines[i])
  names.push(vals[0])
}
console.log("CSV names:")
names.slice(0,20).forEach(n => console.log("  " + n))
console.log("...")
names.slice(490,500).forEach(n => console.log("  " + n))
