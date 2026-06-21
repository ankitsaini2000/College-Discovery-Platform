import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import SignupForm from "@/components/auth/SignupForm"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free CollegeCompass account",
}

export default async function SignupPage() {
  const user = await getCurrentUser()
  if (user) redirect("/dashboard")

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
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500 mt-1">Join thousands of students making smarter college decisions</p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
