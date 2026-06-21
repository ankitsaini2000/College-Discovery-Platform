"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function useRequireAuth(redirectTo: string = "/login") {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      toast.error("Please log in to continue")
      router.push(redirectTo)
    }
  }, [session, status, router, redirectTo])

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  }
}
