"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

const quickFilters = [
  { label: "JEE Main", href: "/colleges?exam=JEE_MAIN" },
  { label: "JEE Advanced", href: "/colleges?exam=JEE_ADVANCED" },
  { label: "NEET", href: "/colleges?exam=NEET" },
  { label: "CAT", href: "/colleges?exam=CAT" },
  { label: "CLAT", href: "/colleges?exam=CLAT" },
]

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/colleges?search=${encodeURIComponent(q)}`)
    } else {
      router.push("/colleges")
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow-2xl flex items-center p-2"
      >
        <div className="flex items-center flex-1 px-3">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search colleges, cities, states..."
            className="w-full px-3 py-3 text-gray-900 placeholder:text-gray-400 text-base focus:outline-none bg-transparent"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {quickFilters.map((filter) => (
          <button
            key={filter.href}
            onClick={() => router.push(filter.href)}
            className="bg-white/20 text-white border border-white/30 rounded-full px-4 py-1.5 text-sm hover:bg-white/30 cursor-pointer transition backdrop-blur-sm"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
