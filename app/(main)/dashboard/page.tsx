import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import DashboardClient from "@/components/dashboard/DashboardClient"

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Your saved colleges and comparisons",
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name?.split(" ")[0]}!
              </h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
      <DashboardClient userId={user.id} />
    </div>
  )
}
