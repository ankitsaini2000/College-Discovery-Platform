export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(request: NextRequest) {
  try {
    const states = await prisma.college.findMany({
      select: { state: true },
      distinct: ["state"],
      orderBy: { state: "asc" },
    })

    return Response.json({
      data: states.map((s) => s.state),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
