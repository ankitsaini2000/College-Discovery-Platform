import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { predictorSchema } from "@/lib/validations"
import { handleApiError } from "@/lib/api-error"

function calculateChancePercentage(
  userRank: number,
  minRank: number,
  maxRank: number
): number {
  if (userRank <= minRank) return 99
  if (userRank > maxRank) {
    const overBy = userRank - maxRank
    const rangeSize = maxRank - minRank
    const chance = Math.max(10, 30 - (overBy / rangeSize) * 30)
    return Math.round(chance)
  }
  const rangeSize = maxRank - minRank
  const positionInRange = userRank - minRank
  const chance = 99 - (positionInRange / rangeSize) * 49
  return Math.round(chance)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const rawParams = {
      exam: searchParams.get("exam"),
      rank: searchParams.get("rank"),
      category: searchParams.get("category") || "GENERAL",
      year: searchParams.get("year") || "2024",
    }

    const parsed = predictorSchema.safeParse(rawParams)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { exam, rank, category, year } = parsed.data

    const reachMultiplier = 1.15

    const cutoffMatches = await prisma.cutoffRank.findMany({
      where: {
        exam: exam,
        year: year,
        category: category,
        minRank: { lte: rank },
        maxRank: { gte: Math.floor(rank / reachMultiplier) },
      },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            fees: true,
            rating: true,
            reviewCount: true,
            imageUrl: true,
            type: true,
            accreditation: true,
            established: true,
            placements: {
              orderBy: { year: "desc" },
              take: 1,
              select: {
                averagePackage: true,
                highestPackage: true,
                placementRate: true,
                year: true,
              },
            },
          },
        },
      },
      orderBy: { minRank: "asc" },
    })

    const safe = []
    const moderate = []
    const reach = []

    for (const cutoff of cutoffMatches) {
      const rangeSize = cutoff.maxRank - cutoff.minRank
      const safeZoneEnd = cutoff.maxRank - rangeSize * 0.2

      const chancePercentage = calculateChancePercentage(
        rank,
        cutoff.minRank,
        cutoff.maxRank
      )

      const formattedResult = {
        cutoffId: cutoff.id,
        college: {
          ...cutoff.college,
          latestPlacement: cutoff.college.placements[0] ?? null,
          placements: undefined,
        },
        cutoff: {
          minRank: cutoff.minRank,
          maxRank: cutoff.maxRank,
          course: cutoff.course,
          exam: cutoff.exam,
          year: cutoff.year,
          category: cutoff.category,
        },
        chancePercentage,
      }

      if (rank <= safeZoneEnd) {
        safe.push({ ...formattedResult, chanceLevel: "SAFE" as const })
      } else if (rank <= cutoff.maxRank) {
        moderate.push({ ...formattedResult, chanceLevel: "MODERATE" as const })
      } else {
        reach.push({ ...formattedResult, chanceLevel: "REACH" as const })
      }
    }

    safe.sort((a, b) => b.chancePercentage - a.chancePercentage)
    moderate.sort((a, b) => b.chancePercentage - a.chancePercentage)
    reach.sort((a, b) => b.chancePercentage - a.chancePercentage)

    return Response.json({
      data: {
        input: { exam, rank, category, year },
        results: { safe, moderate, reach },
        totalFound: cutoffMatches.length,
        summary: {
          safeCount: safe.length,
          moderateCount: moderate.length,
          reachCount: reach.length,
        },
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
