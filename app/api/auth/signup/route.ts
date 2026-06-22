export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signupSchema } from "@/lib/validations"
import { ApiError, handleApiError } from "@/lib/api-error"
import {
  generateVerificationToken,
  sendVerificationEmail,
} from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ApiError(
        "An account with this email already exists",
        409
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
      },
    })

    const token = generateVerificationToken()

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const emailSent = await sendVerificationEmail(email, name, token)

    return Response.json(
      {
        message: emailSent
          ? "Account created. Check your email for a verification link."
          : "Account created, but we couldn't send a verification email. Please contact support.",
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
