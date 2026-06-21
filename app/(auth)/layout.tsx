import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Link
        href="/"
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      {children}
    </div>
  )
}
