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
    const rangeSize = maxRank - minRank || 1
    const chance = Math.max(10, 30 - (overBy / rangeSize) * 30)
    return Math.round(chance)
  }
  const rangeSize = maxRank - minRank || 1
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
      quota: searchParams.get("quota") || undefined,
      gender: searchParams.get("gender") || undefined,
    }

    const parsed = predictorSchema.safeParse(rawParams)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { exam, rank, category, year, quota, gender } = parsed.data

    const reachMultiplier = 1.25

    // Build where clause with optional quota and gender filters
    const whereClause: Record<string, unknown> = {
      exam: exam,
      year: year,
      category: category,
      minRank: { lte: rank },
      maxRank: { gte: Math.floor(rank / reachMultiplier) },
    }

    if (quota) {
      whereClause.quota = quota
    }

    if (gender) {
      whereClause.gender = gender
    }

    const cutoffMatches = await prisma.cutoffRank.findMany({
      where: whereClause,
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
            nirfRank: true,
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

    const formatResult = (cutoff: typeof cutoffMatches[number], chanceLevel: "SAFE" | "MODERATE" | "REACH") => {
      const chancePercentage = calculateChancePercentage(rank, cutoff.minRank, cutoff.maxRank)
      return {
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
          quota: cutoff.quota,
          gender: cutoff.gender,
        },
        chanceLevel,
        chancePercentage,
      }
    }

    const safe: Array<ReturnType<typeof formatResult>> = []
    const moderate: Array<ReturnType<typeof formatResult>> = []
    const reach: Array<ReturnType<typeof formatResult>> = []

    for (const cutoff of cutoffMatches) {
      const rangeSize = cutoff.maxRank - cutoff.minRank
      const safeZoneEnd = cutoff.maxRank - rangeSize * 0.2

      if (rank <= safeZoneEnd) {
        safe.push(formatResult(cutoff, "SAFE"))
      } else if (rank <= cutoff.maxRank) {
        moderate.push(formatResult(cutoff, "MODERATE"))
      } else {
        reach.push(formatResult(cutoff, "REACH"))
      }
    }

    safe.sort((a, b) => b.chancePercentage - a.chancePercentage)
    moderate.sort((a, b) => b.chancePercentage - a.chancePercentage)
    reach.sort((a, b) => b.chancePercentage - a.chancePercentage)

    return Response.json({
      data: {
        input: { exam, rank, category, year, quota: quota || null, gender: gender || null },
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
