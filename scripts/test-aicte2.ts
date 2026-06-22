async function main() {
  const res = await fetch("https://raw.githubusercontent.com/anburocky3/indian-colleges-data/main/data/institutions-with-programmes.json")
  const raw: any[] = await res.json()
  console.log("Total:", raw.length)
  console.log("First 3 keys:", Object.keys(raw[0]))
  console.log("First:", JSON.stringify(raw[0], null, 2).slice(0, 500))
  console.log("Has name field?", "name" in raw[0])
  console.log("Has institute_name?", "institute_name" in raw[0])
}
main()
