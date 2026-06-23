import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your CollegeCompass account",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const user = await getCurrentUser()
  if (user) redirect("/dashboard")

  const errorMessage =
    searchParams.error === "OAuthAccountNotLinked"
      ? "This email is already registered with a different login method"
      : searchParams.error === "CredentialsSignin"
      ? "Invalid email or password"
      : searchParams.error
      ? "Something went wrong. Please try again."
      : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 mb-4">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">CollegeCompass</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Log in to access your saved colleges and comparisons</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <LoginForm callbackUrl={searchParams.callbackUrl} />

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
