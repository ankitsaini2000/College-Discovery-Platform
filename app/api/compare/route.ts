import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { compareSchema } from "@/lib/validations"
import { ApiError, handleApiError } from "@/lib/api-error"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get("ids")

    if (!idsParam) {
      throw new ApiError(
        "Please provide college IDs as ?ids=id1,id2 or ?ids=slug1,slug2",
        400
      )
    }

    const parsed = compareSchema.safeParse({ ids: idsParam })

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid IDs", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const ids = parsed.data.ids

    const colleges = await prisma.college.findMany({
      where: {
        OR: ids.map((id) => ({
          OR: [{ id }, { slug: id }],
        })),
      },
      include: {
        courses: {
          orderBy: { fees: "asc" },
        },
        placements: {
          orderBy: { year: "desc" },
          take: 3,
        },
        cutoffRanks: {
          where: { year: 2024 },
          orderBy: { category: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            savedBy: true,
            reviews: true,
          },
        },
      },
    })

    if (colleges.length < 2) {
      throw new ApiError(
        "Could not find enough colleges. Please check the IDs provided.",
        404
      )
    }

    return Response.json({
      data: {
        colleges,
        comparedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
