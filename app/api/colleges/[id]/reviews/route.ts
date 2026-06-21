import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { reviewSchema } from "@/lib/validations"
import { ApiError, handleApiError } from "@/lib/api-error"
import { getCurrentUser } from "@/lib/session"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new ApiError("You must be logged in to write a review", 401)
    }

    const college = await prisma.college.findFirst({
      where: {
        OR: [
          { slug: params.id },
          { id: params.id },
        ],
      },
    })

    if (!college) {
      throw new ApiError("College not found", 404)
    }

    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid review data", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        collegeId_userId: {
          collegeId: college.id,
          userId: user.id,
        },
      },
    })

    if (existingReview) {
      throw new ApiError(
        "You have already reviewed this college. You can only submit one review per college.",
        409
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          collegeId: college.id,
          userId: user.id,
          rating: parsed.data.rating,
          title: parsed.data.title,
          content: parsed.data.content,
          pros: parsed.data.pros,
          cons: parsed.data.cons,
          batch: parsed.data.batch,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      const allReviews = await tx.review.findMany({
        where: { collegeId: college.id },
        select: { rating: true },
      })

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await tx.college.update({
        where: { id: college.id },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      })

      return review
    })

    return Response.json(
      { data: result, message: "Review submitted successfully" },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
