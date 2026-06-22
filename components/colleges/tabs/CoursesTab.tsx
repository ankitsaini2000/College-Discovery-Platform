import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import type { Course } from "@prisma/client"
import { Badge } from "@/components/ui"
import { Clock, GraduationCap, Users } from "lucide-react"
import AuthPrompt from "@/components/shared/AuthPrompt"

function formatFees(fees: number): string {
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`
  return `₹${fees.toLocaleString("en-IN")}`
}

function groupByDegree(courses: Course[]): Record<string, Course[]> {
  const groups: Record<string, Course[]> = {}
  for (const course of courses) {
    const key = course.degree || "Other"
    if (!groups[key]) groups[key] = []
    groups[key].push(course)
  }
  return groups
}

const degreeLabels: Record<string, string> = {
  B_TECH: "B.Tech Programs",
  M_TECH: "M.Tech Programs",
  MBA: "MBA Programs",
  MBBS: "MBBS Programs",
  BSC: "B.Sc Programs",
  MSC: "M.Sc Programs",
  BBA: "BBA Programs",
  BCA: "BCA Programs",
  OTHER: "Other Programs",
}

export default function CoursesTab({ courses }: { courses: Course[] }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No courses listed yet.</p>
      </div>
    )
  }

  const groups = groupByDegree(courses)
  const minFees = Math.min(...courses.map((c) => c.fees))

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{courses.length}</span> courses available
        </p>
        <p className="text-sm text-blue-600 font-semibold">
          Fees starting from {formatFees(minFees)}
        </p>
      </div>

      <div className="relative mt-6">
        {!session && (
          <AuthPrompt
            overlay
            message="Sign in to view all courses and fees"
            action="Sign In to Unlock"
            callbackUrl={pathname}
          />
        )}
        <div className={`space-y-8 ${!session ? "filter blur-[5px] select-none pointer-events-none max-h-[600px] overflow-hidden" : ""}`}>
          {Object.entries(groups).map(([degree, degreeCourses]) => (
            <section key={degree}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {degreeLabels[degree] || `${degree} Programs`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {degreeCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-semibold text-gray-900">{course.name}</h4>
                  <div className="flex gap-1.5 shrink-0">
                    {course.degree && (
                      <Badge variant="default" size="sm">
                        {course.degree.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {course.duration && (
                      <Badge variant="outline" size="sm">
                        <Clock className="h-3 w-3 mr-0.5" />
                        {course.duration} yrs
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-blue-600 font-semibold text-lg">
                  {formatFees(course.fees)}
                  <span className="text-xs text-gray-500 font-normal"> /year</span>
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  {course.seats && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.seats} seats
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
