export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { saveComparisonSchema } from "@/lib/validations"
import { ApiError, handleApiError } from "@/lib/api-error"
import { getCurrentUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const comparisons = await prisma.savedComparison.findMany({
      where: { userId: user.id },
      include: {
        collegeA: {
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
          },
        },
        collegeB: {
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
          },
        },
        collegeC: {
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return Response.json({ data: comparisons })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const body = await request.json()
    const parsed = saveComparisonSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const collegeIds = [
      parsed.data.collegeAId,
      parsed.data.collegeBId,
      parsed.data.collegeCId,
    ].filter(Boolean)

    const colleges = await prisma.college.findMany({
      where: { id: { in: collegeIds as string[] } },
    })

    if (colleges.length < 2) {
      throw new ApiError("One or more colleges not found", 404)
    }

    const comparison = await prisma.savedComparison.create({
      data: {
        userId: user.id,
        collegeAId: parsed.data.collegeAId,
        collegeBId: parsed.data.collegeBId,
        collegeCId: parsed.data.collegeCId,
      },
    })

    return Response.json(
      { data: comparison, message: "Comparison saved successfully" },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
