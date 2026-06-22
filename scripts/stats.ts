const { PrismaClient } = require("@prisma/client")
const p = new PrismaClient()
Promise.all([
  p.college.count({ where: { fees: { gt: 0 } } }),
  p.college.count({ where: { website: { not: null } } }),
  p.college.count({ where: { phone: { not: null } } }),
  p.college.count({ where: { email: { not: null } } }),
  p.college.count({ where: { accreditation: { not: null } } }),
  p.placement.groupBy({ by: ["collegeId"] }).then((r: any[]) => r.length),
]).then(([f,w,ph,em,ac,pl]) => {
  console.log("Fees:", f, "Website:", w, "Phone:", ph, "Email:", em, "Accred:", ac, "Placements:", pl)
  p.$disconnect()
})
