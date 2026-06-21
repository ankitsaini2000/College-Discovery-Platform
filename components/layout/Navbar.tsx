"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  GraduationCap,
  Columns2,
  Menu,
  X,
  ChevronDown,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui"

const navLinks = [
  { label: "Colleges", href: "/colleges" },
  { label: "Compare", href: "/compare" },
  { label: "Predictor", href: "/predict" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const compareCount = 0

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U"

  function NavLink({
    href,
    label,
    onClick,
  }: {
    href: string
    label: string
    onClick?: () => void
  }) {
    const active = isActive(href)
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
          active
            ? "text-blue-600 bg-blue-50 font-semibold"
            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
              <GraduationCap className="h-7 w-7" />
              CollegeCompass
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}
              {status === "authenticated" && (
                <NavLink href="/dashboard" label="Dashboard" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compareCount > 0 && (
              <Link
                href="/compare"
                className="relative flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Columns2 className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                  {compareCount}
                </span>
              </Link>
            )}

            {status === "authenticated" ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {userInitial}
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {session.user?.email || ""}
                      </p>
                    </div>
                    <div className="border-t border-gray-100" />
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onClick={() => setMobileOpen(false)}
              />
            ))}
            {status === "authenticated" && (
              <NavLink
                href="/dashboard"
                label="Dashboard"
                onClick={() => setMobileOpen(false)}
              />
            )}
          </div>
          <div className="border-t border-gray-100 px-4 py-3 space-y-2">
            {status === "authenticated" ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {userInitial}
                  </div>
                  <div className="truncate">
                    <p className="text-gray-900 font-medium truncate">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs truncate">{session.user?.email || ""}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
