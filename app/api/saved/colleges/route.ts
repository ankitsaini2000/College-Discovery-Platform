import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { saveCollegeSchema } from "@/lib/validations"
import { ApiError, handleApiError } from "@/lib/api-error"
import { getCurrentUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const savedColleges = await prisma.savedCollege.findMany({
      where: { userId: user.id },
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
      orderBy: { createdAt: "desc" },
    })

    return Response.json({
      data: savedColleges.map((saved) => ({
        id: saved.id,
        collegeId: saved.collegeId,
        createdAt: saved.createdAt,
        college: {
          ...saved.college,
          latestPlacement: saved.college.placements[0] ?? null,
          placements: undefined,
        },
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new ApiError("You must be logged in to save colleges", 401)
    }

    const body = await request.json()
    const parsed = saveCollegeSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const college = await prisma.college.findUnique({
      where: { id: parsed.data.collegeId },
    })

    if (!college) {
      throw new ApiError("College not found", 404)
    }

    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId: parsed.data.collegeId,
        },
      },
    })

    if (existing) {
      return Response.json(
        { data: existing, message: "College already saved" },
        { status: 200 }
      )
    }

    const saved = await prisma.savedCollege.create({
      data: {
        userId: user.id,
        collegeId: parsed.data.collegeId,
      },
    })

    return Response.json(
      { data: saved, message: "College saved successfully" },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
