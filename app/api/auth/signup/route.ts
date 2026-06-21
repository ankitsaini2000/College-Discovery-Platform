import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signupSchema } from "@/lib/validations"
import { ApiError, handleApiError } from "@/lib/api-error"

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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return Response.json(
      {
        data: user,
        message: "Account created successfully. Please log in.",
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
