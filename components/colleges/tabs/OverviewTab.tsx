import { Calendar, Building2, Award, MapPin, Globe, BookOpen, Users, Home, Phone, Mail } from "lucide-react"
import { Badge } from "@/components/ui"
import type { CollegeWithRelations } from "@/types"

function formatRank(n: number): string {
  return n.toLocaleString("en-IN")
}

export default function OverviewTab({ college }: { college: CollegeWithRelations }) {
  const highlights = [
    { icon: Calendar, label: "Established", value: college.established || "N/A" },
    { icon: Building2, label: "Type", value: college.type.replace(/_/g, " ") },
    { icon: Award, label: "Accreditation", value: college.accreditation || "N/A" },
    { icon: MapPin, label: "Location", value: `${college.city}, ${college.state}` },
    {
      icon: Globe,
      label: "Website",
      value: college.website ? (
        <a
          href={college.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {college.website.replace(/^https?:\/\//, "")}
        </a>
      ) : "N/A",
    },
    {
      icon: BookOpen,
      label: "Exams Accepted",
      value: college.examAccepted?.length ? (
        <div className="flex flex-wrap gap-1">
          {college.examAccepted.map((e) => (
            <Badge key={e} variant="info" size="sm">
              {e.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      ) : "N/A",
    },
  ]

  // Campus stats
  const campusStats = [
    college.nirfRank ? { label: "NIRF Rank", value: `#${college.nirfRank}`, icon: Award } : null,
    college.campusSize ? { label: "Campus Area", value: college.campusSize, icon: Home } : null,
    college.totalStudents ? { label: "Total Students", value: college.totalStudents.toLocaleString("en-IN"), icon: Users } : null,
    college.totalFaculty ? { label: "Faculty Members", value: college.totalFaculty.toLocaleString("en-IN"), icon: Users } : null,
    college.studentFacultyRatio ? { label: "Student:Faculty", value: college.studentFacultyRatio, icon: Users } : null,
    { label: "Hostel", value: college.hostelAvailable ? "Available" : "Not Available", icon: Home },
  ].filter(Boolean) as { label: string; value: string; icon: typeof Award }[]

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About {college.name}</h2>
        <p className="text-gray-700 leading-relaxed">{college.overview || "No description available."}</p>
      </section>

      {/* Campus Stats */}
      {campusStats.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Campus Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {campusStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <Icon className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.map((h) => {
            const Icon = h.icon
            return (
              <div key={h.label} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{h.label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{h.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Contact Info */}
      {(college.phone || college.email || college.website) && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            {college.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  {college.website}
                </a>
              </div>
            )}
            {college.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{college.phone}</span>
              </div>
            )}
            {college.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${college.email}`} className="text-blue-600 hover:underline text-sm">
                  {college.email}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
        <p className="text-gray-700 mb-3">
          {college.city}, {college.state}, {college.country}
        </p>
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(college.name + " " + college.city)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <MapPin className="h-4 w-4" />
          View on Google Maps
        </a>
      </section>
    </div>
  )
}
