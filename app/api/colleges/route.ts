export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"
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
      instituteType: searchParams.get("instituteType") || undefined,
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
      instituteType,
    } = parsed.data

    const where: Prisma.CollegeWhereInput = {}

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
      where.type = type as Prisma.EnumCollegeTypeFilter["equals"]
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

    // IIT/NIT filter by slug prefix
    if (instituteType === "IIT") {
      where.slug = { startsWith: "iit-" }
    } else if (instituteType === "NIT") {
      where.OR = [
        { slug: { startsWith: "nit-" } },
        { slug: { startsWith: "mnit-" } },
        { slug: { startsWith: "mnnit-" } },
        { slug: { startsWith: "vnit-" } },
        { slug: { startsWith: "svnit-" } },
      ]
    }

    const orderBy: Prisma.CollegeOrderByWithRelationInput = {}
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
          nirfRank: true,
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
      data: colleges.map(({ placements, ...college }) => ({
        ...college,
        latestPlacement: placements[0] ?? null,
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
