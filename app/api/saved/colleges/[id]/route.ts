export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ApiError, handleApiError } from "@/lib/api-error"
import { getCurrentUser } from "@/lib/session"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const saved = await prisma.savedCollege.findUnique({
      where: { id: params.id },
    })

    if (!saved) {
      throw new ApiError("Saved college not found", 404)
    }

    if (saved.userId !== user.id) {
      throw new ApiError("Forbidden", 403)
    }

    await prisma.savedCollege.delete({
      where: { id: params.id },
    })

    return Response.json({ message: "College removed from saved list" })
  } catch (error) {
    return handleApiError(error)
  }
}
