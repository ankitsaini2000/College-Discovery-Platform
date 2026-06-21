export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown) {
  console.error("[API Error]:", error)

  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return Response.json(
      { error: "This record already exists" },
      { status: 409 }
    )
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  ) {
    return Response.json(
      { error: "Record not found" },
      { status: 404 }
    )
  }

  return Response.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}
