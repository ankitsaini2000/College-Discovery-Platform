"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, Clock, X } from "lucide-react"

const quickFilters = [
  { label: "JEE Main", href: "/colleges?exam=JEE_MAIN" },
  { label: "JEE Advanced", href: "/colleges?exam=JEE_ADVANCED" },
  { label: "NEET", href: "/colleges?exam=NEET" },
  { label: "CAT", href: "/colleges?exam=CAT" },
  { label: "CLAT", href: "/colleges?exam=CLAT" },
]

const STORAGE_KEY = "cc-recent-searches"
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveSearch(query: string) {
  const recent = getRecentSearches()
  const filtered = recent.filter((s) => s.toLowerCase() !== query.toLowerCase())
  const updated = [query, ...filtered].slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFocused && !query) {
      setRecentSearches(getRecentSearches())
    }
  }, [isFocused, query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navigate = useCallback(
    (q: string) => {
      const trimmed = q.trim()
      if (trimmed) {
        saveSearch(trimmed)
        router.push(`/colleges?search=${encodeURIComponent(trimmed)}`)
      } else {
        router.push("/colleges")
      }
      setIsFocused(false)
    },
    [router]
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (highlightedIndex >= 0 && recentSearches[highlightedIndex]) {
      navigate(recentSearches[highlightedIndex])
      return
    }
    navigate(query)
  }

  function handleRecentClick(q: string) {
    setQuery(q)
    navigate(q)
  }

  function clearRecent() {
    localStorage.removeItem(STORAGE_KEY)
    setRecentSearches([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isFocused || recentSearches.length === 0 || query) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) => (i < recentSearches.length - 1 ? i + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) => (i > 0 ? i - 1 : recentSearches.length - 1))
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault()
      navigate(recentSearches[highlightedIndex])
    } else if (e.key === "Escape") {
      setIsFocused(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl flex items-center p-2 relative">
        <div className="flex items-center flex-1 px-3">
          {query ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlightedIndex(-1)
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
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

        {isFocused && !query && recentSearches.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Searches</span>
              <button
                onClick={clearRecent}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="py-1">
              {recentSearches.map((search, i) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => handleRecentClick(search)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                    highlightedIndex === i ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
