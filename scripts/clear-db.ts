import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
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
  console.log("DB cleared")
  await prisma.$disconnect()
}
main()
