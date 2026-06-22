import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { GraduationCap, MapPin, Heart, Database, Search, GitCompare, Sparkles, ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui"
import HeroSearch from "@/components/shared/HeroSearch"
import CollegeCard from "@/components/colleges/CollegeCard"

const features = [
  {
    icon: Search,
    title: "Explore IITs & NITs",
    description: "Browse all 23 IITs and 31 NITs with detailed information on courses, fees, placements and rankings",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: GitCompare,
    title: "Compare Side by Side",
    description: "Compare up to 3 IITs/NITs simultaneously across NIRF ranking, fees, placements, cutoffs and more",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    icon: Sparkles,
    title: "JEE Rank Predictor",
    description: "Enter your JEE Main or JEE Advanced rank to find which IITs & NITs you can get into, branch-wise",
    iconBg: "bg-green-100 text-green-600",
  },
]

export default async function HomePage() {
  const [iitCount, nitCount, statesResult, topIITs, topNITs] = await Promise.all([
    prisma.college.count({ where: { slug: { startsWith: "iit-" } } }),
    prisma.college.count({ where: { OR: [{ slug: { startsWith: "nit-" } }, { slug: { startsWith: "mnit-" } }, { slug: { startsWith: "mnnit-" } }, { slug: { startsWith: "vnit-" } }, { slug: { startsWith: "svnit-" } }] } }),
    prisma.college.findMany({ distinct: ["state"], select: { state: true } }),
    prisma.college.findMany({
      where: { slug: { startsWith: "iit-" } },
      orderBy: { nirfRank: "asc" },
      take: 6,
      select: {
        id: true, name: true, slug: true, city: true, state: true, fees: true,
        rating: true, reviewCount: true, imageUrl: true, type: true,
        accreditation: true, established: true, nirfRank: true,
        placements: {
          orderBy: { year: "desc" }, take: 1,
          select: { averagePackage: true, highestPackage: true, placementRate: true, year: true },
        },
      },
    }),
    prisma.college.findMany({
      where: { OR: [{ slug: { startsWith: "nit-" } }, { slug: { startsWith: "mnit-" } }, { slug: { startsWith: "mnnit-" } }, { slug: { startsWith: "vnit-" } }, { slug: { startsWith: "svnit-" } }] },
      orderBy: { nirfRank: "asc" },
      take: 6,
      select: {
        id: true, name: true, slug: true, city: true, state: true, fees: true,
        rating: true, reviewCount: true, imageUrl: true, type: true,
        accreditation: true, established: true, nirfRank: true,
        placements: {
          orderBy: { year: "desc" }, take: 1,
          select: { averagePackage: true, highestPackage: true, placementRate: true, year: true },
        },
      },
    }),
  ])

  const totalStates = statesResult.length

  const formatColleges = (colleges: typeof topIITs) =>
    colleges.map((c) => ({
      ...c,
      latestPlacement: c.placements[0] ?? null,
      placements: undefined,
    }))

  const featuredIITs = formatColleges(topIITs)
  const featuredNITs = formatColleges(topNITs)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center relative z-10">
          <span className="inline-block bg-white/15 backdrop-blur-sm text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
            🏛️ India&apos;s #1 IIT &amp; NIT Discovery Platform
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Find Your Perfect{" "}
            <span className="text-cyan-300">IIT</span> or{" "}
            <span className="text-cyan-300">NIT</span>
          </h1>

          <p className="text-xl text-blue-100 mt-4 max-w-2xl mx-auto">
            Explore {iitCount} IITs & {nitCount} NITs with real JoSAA cutoffs, placements, and branch-wise data across {totalStates} states
          </p>

          <div className="mt-10">
            <HeroSearch />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/predict">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg">
                <Sparkles className="h-4 w-4" />
                JEE Rank Predictor
              </Button>
            </Link>
            <Link href="/compare">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold">
                <GitCompare className="h-4 w-4" />
                Compare Colleges
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">{iitCount}</p>
              <p className="text-gray-600 text-sm">IITs</p>
            </div>
            <div className="text-center">
              <GraduationCap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">{nitCount}</p>
              <p className="text-gray-600 text-sm">NITs</p>
            </div>
            <div className="text-center">
              <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">{totalStates}+</p>
              <p className="text-gray-600 text-sm">States</p>
            </div>
            <div className="text-center">
              <Database className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">JoSAA</p>
              <p className="text-gray-600 text-sm">Real Cutoffs</p>
            </div>
            <div className="text-center">
              <Heart className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-blue-600 font-bold text-2xl">100%</p>
              <p className="text-gray-600 text-sm">Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top IITs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">🏛️ Top IITs</h2>
              <p className="text-gray-600 mt-1">India&apos;s premier engineering institutes ranked by NIRF</p>
            </div>
            <Link href="/colleges?instituteType=IIT" className="hidden sm:block">
              <Button variant="outline">
                View All IITs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredIITs.map((college) => (
              <CollegeCard key={college.id} college={college} showCompareButton={false} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/colleges?instituteType=IIT">
              <Button variant="outline">View All IITs <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top NITs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">🎓 Top NITs</h2>
              <p className="text-gray-600 mt-1">National Institutes of Technology ranked by NIRF</p>
            </div>
            <Link href="/colleges?instituteType=NIT" className="hidden sm:block">
              <Button variant="outline">
                View All NITs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNITs.map((college) => (
              <CollegeCard key={college.id} college={college} showCompareButton={false} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/colleges?instituteType=NIT">
              <Button variant="outline">View All NITs <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Find Your IIT or NIT?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Use our JEE rank predictor to discover your best college options
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/predict">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg">
                <Sparkles className="h-4 w-4" />
                Try JEE Predictor
              </Button>
            </Link>
            <Link href="/colleges">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold">
                Explore All Colleges
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
