export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return Response.json(
    { data, ...(message ? { message } : undefined) },
    { status }
  )
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown
) {
  return Response.json(
    { error, ...(details ? { details } : undefined) },
    { status }
  )
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  return Response.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  })
}
