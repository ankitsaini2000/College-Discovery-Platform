export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  generateVerificationToken,
  sendVerificationEmail,
} from "@/lib/email"
import { ApiError, handleApiError } from "@/lib/api-error"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      throw new ApiError("Email is required", 400)
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return Response.json(
        { error: "No account found with this email" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return Response.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    const token = generateVerificationToken()

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const emailSent = await sendVerificationEmail(email, user.name, token)

    if (!emailSent) {
      throw new ApiError("Failed to send verification email", 500)
    }

    return Response.json({ message: "Verification email sent" })
  } catch (error) {
    return handleApiError(error)
  }
}
