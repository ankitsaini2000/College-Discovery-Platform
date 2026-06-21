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

    const comparison = await prisma.savedComparison.findUnique({
      where: { id: params.id },
    })

    if (!comparison) {
      throw new ApiError("Saved comparison not found", 404)
    }

    if (comparison.userId !== user.id) {
      throw new ApiError("Forbidden", 403)
    }

    await prisma.savedComparison.delete({
      where: { id: params.id },
    })

    return Response.json({ message: "Comparison removed successfully" })
  } catch (error) {
    return handleApiError(error)
  }
}
