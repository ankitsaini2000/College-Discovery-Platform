import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { collegeFilterSchema } from "@/lib/validations"
import { handleApiError } from "@/lib/api-error"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const rawParams = {
      search: searchParams.get("search") || undefined,
      state: searchParams.get("state") || undefined,
      type: searchParams.get("type") || undefined,
      exam: searchParams.get("exam") || undefined,
      minFees: searchParams.get("minFees") || undefined,
      maxFees: searchParams.get("maxFees") || undefined,
      minRating: searchParams.get("minRating") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "12",
      sortBy: searchParams.get("sortBy") || "rating",
      sortOrder: searchParams.get("sortOrder") || "desc",
    }

    const parsed = collegeFilterSchema.safeParse(rawParams)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      search,
      state,
      type,
      exam,
      minFees,
      maxFees,
      minRating,
      page,
      limit,
      sortBy,
      sortOrder,
    } = parsed.data

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
      ]
    }

    if (state) {
      where.state = { equals: state, mode: "insensitive" }
    }

    if (type) {
      where.type = type
    }

    if (exam) {
      where.examAccepted = { has: exam }
    }

    if (minFees !== undefined || maxFees !== undefined) {
      where.fees = {}
      if (minFees !== undefined) where.fees.gte = minFees
      if (maxFees !== undefined) where.fees.lte = maxFees
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating }
    }

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const skip = (page - 1) * limit

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          examAccepted: true,
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
      }),
      prisma.college.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return Response.json({
      data: colleges.map((college) => ({
        ...college,
        latestPlacement: college.placements[0] ?? null,
        placements: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
