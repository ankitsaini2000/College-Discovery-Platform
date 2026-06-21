"use client"

import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui"

interface AuthPromptProps {
  message?: string
  action?: string
  callbackUrl?: string
}

export default function AuthPrompt({
  message = "You need to be logged in to do this",
  action = "Log In",
  callbackUrl,
}: AuthPromptProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
        <Lock className="w-6 h-6 text-blue-600" />
      </div>
      <p className="text-gray-700 font-medium mb-1">{message}</p>
      <p className="text-gray-500 text-sm mb-4">
        Create a free account to access all features
      </p>
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => {
            const url = callbackUrl
              ? `/login?callbackUrl=${callbackUrl}`
              : "/login"
            router.push(url)
          }}
        >
          {action}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/signup")}
        >
          Sign Up Free
        </Button>
      </div>
    </div>
  )
}
