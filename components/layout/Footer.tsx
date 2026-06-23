import Link from "next/link"
import { GraduationCap } from "lucide-react"

const exploreLinks = [
  { label: "Browse Colleges", href: "/colleges" },
  { label: "Compare Colleges", href: "/compare" },
  { label: "College Predictor", href: "/predict" },
]

const examLinks = [
  { label: "JEE Main Colleges", href: "/colleges?exam=JEE_MAIN" },
  { label: "JEE Advanced Colleges", href: "/colleges?exam=JEE_ADVANCED" }
]

const typeLinks = [
  { label: "Government Colleges", href: "/colleges?type=GOVERNMENT" },
  { label: "Private Colleges", href: "/colleges?type=PRIVATE" },
  { label: "Deemed Universities", href: "/colleges?type=DEEMED" },
  { label: "IITs", href: "/colleges?search=IIT" },
  { label: "NITs", href: "/colleges?search=NIT" },
]

function LinkColumn({
  heading,
  links,
}: {
  heading: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-4">{heading}</h3>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-gray-400 hover:text-white text-sm transition-colors block py-1"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <GraduationCap className="h-7 w-7" />
              CollegeCompass
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Find your perfect college with data-driven insights
            </p>
            <p className="text-gray-500 text-xs">
              &copy; 2026 CollegeCompass. All rights reserved.
            </p>
          </div>
          <LinkColumn heading="Explore" links={exploreLinks} />
          <LinkColumn heading="By Exam" links={examLinks} />
          <LinkColumn heading="By Type" links={typeLinks} />
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-sm">
            Built with Next.js, PostgreSQL and Prisma
          </p>
          <p className="text-gray-500 text-sm font-medium">
            Made by Ankit Saini
          </p>
          <p className="text-gray-500 text-sm">
            Made for the CollegeCompass internship demo
          </p>
        </div>
      </div>
    </footer>
  )
}
