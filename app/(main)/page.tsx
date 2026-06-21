import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { GraduationCap, MapPin, Heart, Database, Search, GitCompare, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui"
import HeroSearch from "@/components/shared/HeroSearch"

const features = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Search 500+ colleges with advanced filters by location, fees, exam, type and rating",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: GitCompare,
    title: "Compare Side by Side",
    description: "Compare up to 3 colleges simultaneously across fees, placements, ratings and more",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    icon: Sparkles,
    title: "Predict Your Chances",
    description: "Enter your exam rank and get personalized college recommendations with admission chances",
    iconBg: "bg-green-100 text-green-600",
  },
]

export default async function HomePage() {
  const [collegeCount, statesResult, topColleges] = await Promise.all([
    prisma.college.count(),
    prisma.college.findMany({ distinct: ["state"], select: { state: true } }),
    prisma.college.findMany({
      orderBy: { rating: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        fees: true,
        rating: true,
        reviewCount: true,
        imageUrl: true,
        type: true,
      },
    }),
  ])

  const totalStates = statesResult.length

  return (
    <>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="inline-block bg-white text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            &#x1F393; India&apos;s Most Trusted College Discovery Platform
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Find Your{" "}
            <span className="text-cyan-300">Perfect</span>
            <br />
            College in India
          </h1>

          <p className="text-xl text-blue-100 mt-4 max-w-2xl mx-auto">
            Compare {collegeCount}+ colleges, check cutoffs, predict admissions across {totalStates} states
          </p>

          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <GraduationCap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">{collegeCount}+</p>
              <p className="text-gray-600 text-sm">Colleges</p>
            </div>
            <div className="text-center">
              <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">{totalStates}+</p>
              <p className="text-gray-600 text-sm">States</p>
            </div>
            <div className="text-center">
              <Heart className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">100%</p>
              <p className="text-gray-600 text-sm">Free</p>
            </div>
            <div className="text-center">
              <Database className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">Real</p>
              <p className="text-gray-600 text-sm">Data</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Top Rated Colleges</h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Handpicked colleges based on ratings, placements and student reviews
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topColleges.map((college) => (
              <Link
                key={college.id}
                href={`/colleges/${college.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">
                    {college.type.replace(/_/g, " ")}
                  </div>
                  {college.rating && (
                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {college.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{college.name}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {college.city}, {college.state}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {college.reviewCount} reviews
                  </span>
                  {college.fees && (
                    <span className="text-gray-900 font-medium">
                      &#x20B9;{(college.fees / 1000).toFixed(0)}K
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/colleges">
              <Button variant="outline" size="lg">
                View All Colleges
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Decide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${feature.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Find Your College?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of students making smarter college decisions
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/colleges">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Explore Colleges
              </Button>
            </Link>
            <Link href="/predict">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                Try Predictor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
