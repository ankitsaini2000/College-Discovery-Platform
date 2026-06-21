import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { ApiError } from "@/lib/api-error"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const college = await prisma.college.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id },
        ],
      },
      include: {
        courses: {
          orderBy: { fees: "asc" },
        },
        placements: {
          orderBy: { year: "desc" },
          take: 5,
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
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
        cutoffRanks: {
          orderBy: [
            { year: "desc" },
            { category: "asc" },
          ],
        },
        _count: {
          select: {
            savedBy: true,
            reviews: true,
          },
        },
      },
    })

    if (!college) {
      throw new ApiError("College not found", 404)
    }

    return Response.json({ data: college })
  } catch (error) {
    return handleApiError(error)
  }
}
