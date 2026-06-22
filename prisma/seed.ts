import { PrismaClient, CollegeType, ExamType, Category } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// ─── Types ───────────────────────────────────────────────────────────────────

type CollegeSeed = {
  name: string
  slug: string
  location: string
  city: string
  state: string
  fees: number
  rating: number
  type: CollegeType
  accreditation: string
  established: number
  overview: string
  website: string
  nirfRank: number | null
  campusSize: string | null
  totalStudents: number | null
  totalFaculty: number | null
  studentFacultyRatio: string | null
  examAccepted: ExamType[]
  courses: { name: string; duration: string; fees: number; seats: number; degree: string }[]
  placements: { year: number; averagePackage: number; highestPackage: number; placementRate: number; topRecruiters: string[] }[]
  cutoffRanks: { exam: ExamType; year: number; category: Category; minRank: number; maxRank: number; course: string; quota?: string; gender?: string }[]
}

// ─── IIT DATA (23 IITs) ─────────────────────────────────────────────────────
// Data sourced from: JoSAA 2024 Round 6 closing ranks, NIRF 2024, official placement reports

const iitColleges: CollegeSeed[] = [
  {
    name: "Indian Institute of Technology Madras",
    slug: "iit-madras",
    location: "Guindy, Chennai, Tamil Nadu",
    city: "Chennai",
    state: "Tamil Nadu",
    fees: 228650,
    rating: 4.8,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1959,
    website: "https://www.iitm.ac.in",
    nirfRank: 1,
    campusSize: "617 acres",
    totalStudents: 10900,
    totalFaculty: 650,
    studentFacultyRatio: "17:1",
    overview: "Indian Institute of Technology Madras, consistently ranked #1 in India by NIRF, is set within the lush Guindy National Park in Chennai. Known for pioneering research in engineering, sciences and humanities, IIT Madras has established India's first university-based research park. The institute's startup incubation ecosystem has produced 300+ startups. IIT Madras offers world-class academic programs with a strong emphasis on interdisciplinary research and innovation.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 228650, seats: 90, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 228650, seats: 100, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 228650, seats: 113, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 228650, seats: 65, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 228650, seats: 68, degree: "B.Tech" },
      { name: "B.Tech Aerospace Engineering", duration: "4 years", fees: 228650, seats: 49, degree: "B.Tech" },
      { name: "B.Tech Engineering Physics", duration: "4 years", fees: 228650, seats: 24, degree: "B.Tech" },
      { name: "B.Tech Metallurgical and Materials Engineering", duration: "4 years", fees: 228650, seats: 56, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 2420000, highestPackage: 30700000, placementRate: 96, topRecruiters: ["Google", "Microsoft", "Apple", "Texas Instruments", "Qualcomm", "Goldman Sachs", "McKinsey"] },
      { year: 2023, averagePackage: 2180000, highestPackage: 25000000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Amazon", "Intel", "Flipkart", "DE Shaw"] },
    ],
    cutoffRanks: [
      // CSE
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 147, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 75, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 30, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.ST, minRank: 1, maxRank: 13, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.EWS, minRank: 1, maxRank: 20, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      // Electrical
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 120, maxRank: 575, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 50, maxRank: 250, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 10, maxRank: 110, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      // Mechanical
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 400, maxRank: 2200, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 200, maxRank: 900, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      // Civil
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2100, maxRank: 5200, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      // Chemical
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2500, maxRank: 5800, course: "Chemical Engineering", quota: "AI", gender: "Gender-Neutral" },
      // Aerospace
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 600, maxRank: 2800, course: "Aerospace Engineering", quota: "AI", gender: "Gender-Neutral" },
      // 2023 data
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 155, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 130, maxRank: 600, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Delhi",
    slug: "iit-delhi",
    location: "Hauz Khas, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    fees: 224900,
    rating: 4.8,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1961,
    website: "https://www.iitd.ac.in",
    nirfRank: 2,
    campusSize: "320 acres",
    totalStudents: 9500,
    totalFaculty: 620,
    studentFacultyRatio: "15:1",
    overview: "Indian Institute of Technology Delhi, ranked #2 in India by NIRF, is a premier engineering institution located in the heart of New Delhi. Known for cutting-edge research, excellent faculty and strong industry connections. IIT Delhi has a strong culture of entrepreneurship and innovation with numerous successful startups born from its campus. The institute offers world-class infrastructure and access to top companies for placements.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 224900, seats: 75, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 224900, seats: 85, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 224900, seats: 85, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 224900, seats: 58, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 224900, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Engineering Physics", duration: "4 years", fees: 224900, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Textile Technology", duration: "4 years", fees: 224900, seats: 50, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 2650000, highestPackage: 31700000, placementRate: 97, topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "McKinsey", "Apple", "Flipkart", "Uber"] },
      { year: 2023, averagePackage: 2450000, highestPackage: 27200000, placementRate: 96, topRecruiters: ["Google", "Microsoft", "Amazon", "Facebook", "DE Shaw", "Sprinklr"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 107, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 55, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 22, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.ST, minRank: 1, maxRank: 10, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.EWS, minRank: 1, maxRank: 15, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 90, maxRank: 420, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 40, maxRank: 185, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 380, maxRank: 1900, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1800, maxRank: 4200, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2200, maxRank: 4800, course: "Chemical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 118, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 100, maxRank: 450, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Bombay",
    slug: "iit-bombay",
    location: "Powai, Mumbai, Maharashtra",
    city: "Mumbai",
    state: "Maharashtra",
    fees: 229400,
    rating: 4.9,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1958,
    website: "https://www.iitb.ac.in",
    nirfRank: 3,
    campusSize: "550 acres",
    totalStudents: 11600,
    totalFaculty: 700,
    studentFacultyRatio: "17:1",
    overview: "Indian Institute of Technology Bombay is one of the most prestigious engineering institutes globally. Located on a beautiful 550-acre campus beside Powai Lake, IIT Bombay is consistently ranked among the top 3 in India. The institute is known for its rigorous academic programs, cutting-edge research facilities and a vibrant student community. IIT Bombay's alumni network includes numerous entrepreneurs, researchers and industry leaders. The campus hosts Techfest, Asia's largest science and technology festival.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 229400, seats: 110, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 229400, seats: 100, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 229400, seats: 100, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 229400, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 229400, seats: 80, degree: "B.Tech" },
      { name: "B.Tech Aerospace Engineering", duration: "4 years", fees: 229400, seats: 36, degree: "B.Tech" },
      { name: "B.Tech Engineering Physics", duration: "4 years", fees: 229400, seats: 33, degree: "B.Tech" },
      { name: "B.Tech Metallurgical Engineering and Materials Science", duration: "4 years", fees: 229400, seats: 63, degree: "B.Tech" },
      { name: "B.S. in Mathematics", duration: "4 years", fees: 229400, seats: 25, degree: "B.S." },
    ],
    placements: [
      { year: 2024, averagePackage: 2830000, highestPackage: 34400000, placementRate: 98, topRecruiters: ["Google", "Microsoft", "Apple", "Goldman Sachs", "McKinsey", "Tower Research", "Graviton"] },
      { year: 2023, averagePackage: 2560000, highestPackage: 28000000, placementRate: 97, topRecruiters: ["Google", "Microsoft", "Amazon", "Facebook", "DE Shaw", "Uber"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 68, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 38, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 15, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.ST, minRank: 1, maxRank: 7, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.EWS, minRank: 1, maxRank: 10, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 55, maxRank: 350, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 25, maxRank: 160, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 5, maxRank: 65, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 300, maxRank: 1600, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 600, maxRank: 2700, course: "Aerospace Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1500, maxRank: 3800, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2000, maxRank: 4500, course: "Chemical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 120, maxRank: 550, course: "Engineering Physics", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 72, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 60, maxRank: 370, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Kanpur",
    slug: "iit-kanpur",
    location: "Kalyanpur, Kanpur, Uttar Pradesh",
    city: "Kanpur",
    state: "Uttar Pradesh",
    fees: 222200,
    rating: 4.7,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1959,
    website: "https://www.iitk.ac.in",
    nirfRank: 4,
    campusSize: "1055 acres",
    totalStudents: 9200,
    totalFaculty: 480,
    studentFacultyRatio: "19:1",
    overview: "Indian Institute of Technology Kanpur, set on a sprawling 1055-acre campus, is known for its strong emphasis on science and engineering education. IIT Kanpur pioneered computer science education in India and established the first Computer Centre in the country. The institute has a strong research focus with multiple centres of excellence and has produced numerous distinguished scientists, entrepreneurs and industry leaders globally.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 222200, seats: 87, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 222200, seats: 105, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 222200, seats: 96, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 222200, seats: 68, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 222200, seats: 65, degree: "B.Tech" },
      { name: "B.Tech Aerospace Engineering", duration: "4 years", fees: 222200, seats: 40, degree: "B.Tech" },
      { name: "B.S. in Mathematics and Scientific Computing", duration: "4 years", fees: 222200, seats: 40, degree: "B.S." },
    ],
    placements: [
      { year: 2024, averagePackage: 2450000, highestPackage: 27200000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs", "Flipkart", "Samsung", "Sprinklr"] },
      { year: 2023, averagePackage: 2240000, highestPackage: 24000000, placementRate: 94, topRecruiters: ["Microsoft", "Amazon", "Facebook", "Uber", "DE Shaw", "Sprinklr"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 240, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 115, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 50, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.ST, minRank: 1, maxRank: 22, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.EWS, minRank: 1, maxRank: 35, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 200, maxRank: 750, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 700, maxRank: 2800, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2700, maxRank: 6000, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 3200, maxRank: 6500, course: "Chemical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 260, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Kharagpur",
    slug: "iit-kharagpur",
    location: "Kharagpur, West Bengal",
    city: "Kharagpur",
    state: "West Bengal",
    fees: 219450,
    rating: 4.7,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1951,
    website: "https://www.iitkgp.ac.in",
    nirfRank: 5,
    campusSize: "2100 acres",
    totalStudents: 12000,
    totalFaculty: 700,
    studentFacultyRatio: "17:1",
    overview: "Indian Institute of Technology Kharagpur is the first and largest IIT, established in 1951. Spread over 2100 acres, it has the largest campus among all IITs. IIT Kharagpur offers the widest range of programs among IITs with 19 academic departments. The institute is known for its Spring Fest and Kshitij (Asia's largest techno-management fest). Notable alumni include Sundar Pichai (CEO of Google/Alphabet).",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 219450, seats: 80, degree: "B.Tech" },
      { name: "B.Tech Electronics and Electrical Communication Engineering", duration: "4 years", fees: 219450, seats: 80, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 219450, seats: 90, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 219450, seats: 65, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 219450, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Aerospace Engineering", duration: "4 years", fees: 219450, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Mining Engineering", duration: "4 years", fees: 219450, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Agricultural and Food Engineering", duration: "4 years", fees: 219450, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Architecture", duration: "5 years", fees: 219450, seats: 35, degree: "B.Arch" },
    ],
    placements: [
      { year: 2024, averagePackage: 2280000, highestPackage: 28000000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "Amazon", "Flipkart", "McKinsey", "Shell"] },
      { year: 2023, averagePackage: 2100000, highestPackage: 23000000, placementRate: 94, topRecruiters: ["Microsoft", "Amazon", "Goldman Sachs", "Samsung", "Flipkart", "Qualcomm"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 350, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 170, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 70, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.ST, minRank: 1, maxRank: 30, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 250, maxRank: 1100, course: "Electronics and Electrical Communication Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 800, maxRank: 3200, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 3000, maxRank: 6800, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 380, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Roorkee",
    slug: "iit-roorkee",
    location: "Roorkee, Uttarakhand",
    city: "Roorkee",
    state: "Uttarakhand",
    fees: 217550,
    rating: 4.6,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1847,
    website: "https://www.iitr.ac.in",
    nirfRank: 6,
    campusSize: "365 acres",
    totalStudents: 8600,
    totalFaculty: 500,
    studentFacultyRatio: "17:1",
    overview: "Indian Institute of Technology Roorkee, originally established in 1847 as the Roorkee Engineering College, is Asia's oldest technical institution. IIT Roorkee has a rich heritage spanning over 175 years and was declared an IIT in 2001. The institute is renowned for its civil engineering and architecture programs and has contributed significantly to India's infrastructure development.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 217550, seats: 95, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 217550, seats: 90, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 217550, seats: 90, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 217550, seats: 90, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 217550, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Metallurgical and Materials Engineering", duration: "4 years", fees: 217550, seats: 50, degree: "B.Tech" },
      { name: "B.Arch Architecture", duration: "5 years", fees: 217550, seats: 40, degree: "B.Arch" },
    ],
    placements: [
      { year: 2024, averagePackage: 2120000, highestPackage: 26000000, placementRate: 94, topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs", "Samsung", "Texas Instruments", "Qualcomm"] },
      { year: 2023, averagePackage: 1950000, highestPackage: 22000000, placementRate: 93, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Flipkart", "Oracle", "Accenture"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 580, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 280, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 110, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 450, maxRank: 1600, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1500, maxRank: 4500, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 4000, maxRank: 7500, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 620, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Guwahati",
    slug: "iit-guwahati",
    location: "North Guwahati, Guwahati, Assam",
    city: "Guwahati",
    state: "Assam",
    fees: 220000,
    rating: 4.5,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1994,
    website: "https://www.iitg.ac.in",
    nirfRank: 7,
    campusSize: "700 acres",
    totalStudents: 6800,
    totalFaculty: 420,
    studentFacultyRatio: "16:1",
    overview: "Indian Institute of Technology Guwahati, situated on the banks of the Brahmaputra river, is one of the newer IITs that has rapidly risen in rankings. The 700-acre campus is known for its natural beauty with hills, valleys and a lake. IIT Guwahati is strong in nanotechnology, energy and environmental sciences research and is considered the gateway to engineering education in Northeast India.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 90, degree: "B.Tech" },
      { name: "B.Tech Electronics and Electrical Engineering", duration: "4 years", fees: 220000, seats: 85, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 80, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 220000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 220000, seats: 45, degree: "B.Tech" },
      { name: "B.Des Design", duration: "4 years", fees: 220000, seats: 30, degree: "B.Des" },
    ],
    placements: [
      { year: 2024, averagePackage: 2050000, highestPackage: 23500000, placementRate: 93, topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs", "Flipkart", "Samsung", "Qualcomm"] },
      { year: 2023, averagePackage: 1850000, highestPackage: 20000000, placementRate: 92, topRecruiters: ["Microsoft", "Amazon", "Intel", "Samsung", "Flipkart", "TCS"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 820, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 400, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 160, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 600, maxRank: 2200, course: "Electronics and Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2000, maxRank: 5200, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 4800, maxRank: 8500, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 880, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Hyderabad",
    slug: "iit-hyderabad",
    location: "Kandi, Sangareddy, Telangana",
    city: "Hyderabad",
    state: "Telangana",
    fees: 225000,
    rating: 4.5,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 2008,
    website: "https://www.iith.ac.in",
    nirfRank: 8,
    campusSize: "576 acres",
    totalStudents: 4200,
    totalFaculty: 280,
    studentFacultyRatio: "15:1",
    overview: "Indian Institute of Technology Hyderabad is one of the second-generation IITs and has rapidly emerged as a top institution. Known for its research output and industry collaborations, IIT Hyderabad has a strong focus on AI, machine learning, biomedical engineering and sustainable energy. The institute has established partnerships with Japanese universities and industries.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 225000, seats: 60, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 225000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 225000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 225000, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 225000, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Biomedical Engineering", duration: "4 years", fees: 225000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech AI and Machine Learning", duration: "4 years", fees: 225000, seats: 35, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1950000, highestPackage: 22000000, placementRate: 92, topRecruiters: ["Google", "Microsoft", "Amazon", "Texas Instruments", "Qualcomm", "Samsung", "Flipkart"] },
      { year: 2023, averagePackage: 1750000, highestPackage: 18000000, placementRate: 91, topRecruiters: ["Microsoft", "Amazon", "Intel", "Samsung", "Qualcomm", "Flipkart"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 700, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 340, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 135, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 550, maxRank: 2400, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2200, maxRank: 5600, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 5000, maxRank: 9000, course: "Civil Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 750, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology (BHU) Varanasi",
    slug: "iit-bhu",
    location: "Varanasi, Uttar Pradesh",
    city: "Varanasi",
    state: "Uttar Pradesh",
    fees: 218000,
    rating: 4.4,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1919,
    website: "https://www.iitbhu.ac.in",
    nirfRank: 11,
    campusSize: "1300 acres",
    totalStudents: 7200,
    totalFaculty: 420,
    studentFacultyRatio: "17:1",
    overview: "Indian Institute of Technology (BHU) Varanasi was established in 1919 as the Benares Engineering College within BHU campus. It became an IIT in 2012. The institute has a rich heritage and is located within the sprawling BHU campus in the ancient city of Varanasi. IIT BHU offers programs across engineering, science and pharmacy with strong industry collaborations.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 218000, seats: 80, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 218000, seats: 82, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 218000, seats: 88, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 218000, seats: 68, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 218000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Mining Engineering", duration: "4 years", fees: 218000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Ceramic Engineering", duration: "4 years", fees: 218000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Metallurgical Engineering", duration: "4 years", fees: 218000, seats: 50, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1850000, highestPackage: 21000000, placementRate: 92, topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs", "Samsung", "Flipkart", "Oracle"] },
      { year: 2023, averagePackage: 1680000, highestPackage: 18000000, placementRate: 90, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Flipkart", "Oracle", "Cognizant"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 1100, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 530, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 220, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 900, maxRank: 2700, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2500, maxRank: 6200, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 1200, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Indore",
    slug: "iit-indore",
    location: "Simrol, Indore, Madhya Pradesh",
    city: "Indore",
    state: "Madhya Pradesh",
    fees: 223000,
    rating: 4.3,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 2009,
    website: "https://www.iiti.ac.in",
    nirfRank: 13,
    campusSize: "510 acres",
    totalStudents: 3200,
    totalFaculty: 200,
    studentFacultyRatio: "16:1",
    overview: "Indian Institute of Technology Indore is a new-generation IIT known for its excellent research output per faculty and rapid growth in rankings. The institute has a strong focus on interdisciplinary research and offers modern academic programs. Despite being relatively young, IIT Indore has established itself among the top engineering institutions in India.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 223000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 223000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 223000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 223000, seats: 35, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1650000, highestPackage: 17000000, placementRate: 89, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Goldman Sachs", "Flipkart", "Sprinklr"] },
      { year: 2023, averagePackage: 1520000, highestPackage: 15000000, placementRate: 87, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Flipkart", "Oracle"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 2000, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 980, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1600, maxRank: 4200, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 3800, maxRank: 7500, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology (ISM) Dhanbad",
    slug: "iit-dhanbad",
    location: "Dhanbad, Jharkhand",
    city: "Dhanbad",
    state: "Jharkhand",
    fees: 215000,
    rating: 4.3,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1926,
    website: "https://www.iitism.ac.in",
    nirfRank: 15,
    campusSize: "218 acres",
    totalStudents: 6500,
    totalFaculty: 380,
    studentFacultyRatio: "17:1",
    overview: "Indian Institute of Technology (Indian School of Mines) Dhanbad was established in 1926 and became an IIT in 2016. The institute was originally set up for mining and geology but now offers a wide range of engineering programs. IIT ISM Dhanbad has a strong alumni network in mining, petroleum and energy sectors. The institute is known for its practical approach to engineering education.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 215000, seats: 68, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 215000, seats: 70, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 215000, seats: 72, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 215000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 215000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Mining Engineering", duration: "4 years", fees: 215000, seats: 68, degree: "B.Tech" },
      { name: "B.Tech Petroleum Engineering", duration: "4 years", fees: 215000, seats: 45, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1520000, highestPackage: 15000000, placementRate: 88, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Coal India", "ONGC", "Goldman Sachs"] },
      { year: 2023, averagePackage: 1380000, highestPackage: 12000000, placementRate: 86, topRecruiters: ["Amazon", "Samsung", "Coal India", "ONGC", "Flipkart"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 2700, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1300, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2200, maxRank: 5500, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 5000, maxRank: 9000, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Gandhinagar",
    slug: "iit-gandhinagar",
    location: "Palaj, Gandhinagar, Gujarat",
    city: "Gandhinagar",
    state: "Gujarat",
    fees: 225000,
    rating: 4.3,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2008,
    website: "https://www.iitgn.ac.in",
    nirfRank: 23,
    campusSize: "400 acres",
    totalStudents: 2400,
    totalFaculty: 170,
    studentFacultyRatio: "14:1",
    overview: "Indian Institute of Technology Gandhinagar is known for its liberal education approach and emphasis on design thinking. The institute offers a unique Foundation Programme for all first-year students. IIT Gandhinagar's modern campus was designed by renowned architect Hafeez Contractor. The institute focuses on cognitive science, earth sciences and material science research.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 225000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 225000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 225000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 225000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 225000, seats: 35, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1580000, highestPackage: 16000000, placementRate: 88, topRecruiters: ["Microsoft", "Amazon", "Goldman Sachs", "Flipkart", "Sprinklr", "Qualcomm"] },
      { year: 2023, averagePackage: 1420000, highestPackage: 14000000, placementRate: 86, topRecruiters: ["Microsoft", "Amazon", "Flipkart", "Oracle", "Samsung"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 2500, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1200, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2000, maxRank: 5000, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 4500, maxRank: 8000, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Bhubaneswar",
    slug: "iit-bhubaneswar",
    location: "Argul, Khordha, Odisha",
    city: "Bhubaneswar",
    state: "Odisha",
    fees: 220000,
    rating: 4.2,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2008,
    website: "https://www.iitbbs.ac.in",
    nirfRank: 27,
    campusSize: "936 acres",
    totalStudents: 2800,
    totalFaculty: 180,
    studentFacultyRatio: "16:1",
    overview: "Indian Institute of Technology Bhubaneswar is a new-generation IIT established in 2008. The institute has a vast 936-acre campus and focuses on school-based academic structure rather than traditional departments. IIT Bhubaneswar has been rapidly developing its infrastructure and research capabilities with a focus on climate science, infrastructure and energy.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 220000, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Metallurgical and Materials Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1420000, highestPackage: 14000000, placementRate: 86, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Flipkart", "Tata Steel", "L&T"] },
      { year: 2023, averagePackage: 1280000, highestPackage: 12000000, placementRate: 84, topRecruiters: ["Amazon", "Samsung", "Flipkart", "Oracle", "Tata Steel"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 3500, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1700, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2800, maxRank: 6500, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 5500, maxRank: 9500, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Patna",
    slug: "iit-patna",
    location: "Bihta, Patna, Bihar",
    city: "Patna",
    state: "Bihar",
    fees: 218000,
    rating: 4.1,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2008,
    website: "https://www.iitp.ac.in",
    nirfRank: 24,
    campusSize: "501 acres",
    totalStudents: 2600,
    totalFaculty: 170,
    studentFacultyRatio: "15:1",
    overview: "Indian Institute of Technology Patna, established in 2008, has rapidly developed its academic programs and research capabilities. The institute's permanent campus at Bihta has state-of-the-art infrastructure. IIT Patna focuses on computational research, signal processing and renewable energy technologies.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 218000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 218000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 218000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 218000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 218000, seats: 30, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1380000, highestPackage: 14500000, placementRate: 85, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Goldman Sachs", "Flipkart"] },
      { year: 2023, averagePackage: 1250000, highestPackage: 12000000, placementRate: 83, topRecruiters: ["Amazon", "Samsung", "Flipkart", "Oracle", "TCS"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 3200, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1550, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2600, maxRank: 6200, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 5500, maxRank: 9200, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Ropar",
    slug: "iit-ropar",
    location: "Rupnagar, Punjab",
    city: "Rupnagar",
    state: "Punjab",
    fees: 222000,
    rating: 4.2,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2008,
    website: "https://www.iitrpr.ac.in",
    nirfRank: 29,
    campusSize: "501 acres",
    totalStudents: 2200,
    totalFaculty: 160,
    studentFacultyRatio: "14:1",
    overview: "Indian Institute of Technology Ropar is a second-generation IIT in Punjab known for its strong research output. The institute focuses on biomedical engineering, AI and data analytics. IIT Ropar's campus is located on the banks of the Sutlej river with modern infrastructure and facilities.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 222000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 222000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 222000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 222000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 222000, seats: 30, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1450000, highestPackage: 15500000, placementRate: 87, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Goldman Sachs", "Flipkart", "Oracle"] },
      { year: 2023, averagePackage: 1320000, highestPackage: 13000000, placementRate: 85, topRecruiters: ["Amazon", "Samsung", "Flipkart", "Oracle", "TCS"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 2800, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1350, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2300, maxRank: 5800, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 5200, maxRank: 9000, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Jodhpur",
    slug: "iit-jodhpur",
    location: "Karwar, Jodhpur, Rajasthan",
    city: "Jodhpur",
    state: "Rajasthan",
    fees: 222000,
    rating: 4.1,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2008,
    website: "https://www.iitj.ac.in",
    nirfRank: 35,
    campusSize: "852 acres",
    totalStudents: 2500,
    totalFaculty: 160,
    studentFacultyRatio: "16:1",
    overview: "Indian Institute of Technology Jodhpur is located in the Thar Desert region and focuses on digital humanities, IoT and smart cities research. The institute offers unique programs in AI and Data Science. IIT Jodhpur's desert campus provides a unique learning environment with modern facilities.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 222000, seats: 55, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 222000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 222000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 222000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech AI and Data Science", duration: "4 years", fees: 222000, seats: 30, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1350000, highestPackage: 14000000, placementRate: 84, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Flipkart", "Qualcomm"] },
      { year: 2023, averagePackage: 1220000, highestPackage: 12000000, placementRate: 82, topRecruiters: ["Amazon", "Samsung", "Flipkart", "Oracle"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 3000, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1450, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2500, maxRank: 6000, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 5500, maxRank: 9500, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Mandi",
    slug: "iit-mandi",
    location: "Kamand, Mandi, Himachal Pradesh",
    city: "Mandi",
    state: "Himachal Pradesh",
    fees: 220000,
    rating: 4.1,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2009,
    website: "https://www.iitmandi.ac.in",
    nirfRank: 33,
    campusSize: "530 acres",
    totalStudents: 2000,
    totalFaculty: 150,
    studentFacultyRatio: "13:1",
    overview: "Indian Institute of Technology Mandi is a picturesque hill IIT located in the Himalayas. Known for its project-based curriculum inspired by UCL London, IIT Mandi focuses on sustainable technology, bio-engineering and renewable energy. The campus nestled in the Uhl valley provides a serene environment for learning and research.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 50, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 45, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Data Science and Engineering", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1320000, highestPackage: 13500000, placementRate: 83, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Flipkart", "PayPal"] },
      { year: 2023, averagePackage: 1180000, highestPackage: 11000000, placementRate: 81, topRecruiters: ["Amazon", "Samsung", "Flipkart", "Oracle"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 3500, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1700, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 2800, maxRank: 6500, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 6000, maxRank: 10000, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Tirupati",
    slug: "iit-tirupati",
    location: "Yerpedu, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    state: "Andhra Pradesh",
    fees: 220000,
    rating: 4.0,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2015,
    website: "https://www.iittp.ac.in",
    nirfRank: 25,
    campusSize: "543 acres",
    totalStudents: 1500,
    totalFaculty: 120,
    studentFacultyRatio: "13:1",
    overview: "Indian Institute of Technology Tirupati is a third-generation IIT mentored by IIT Madras. The institute benefits from its mentor institute's expertise and offers strong programs in computer science and electrical engineering. Located near the holy city of Tirupati, the institute is developing its permanent campus with world-class facilities.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1280000, highestPackage: 12000000, placementRate: 82, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Flipkart", "TCS"] },
      { year: 2023, averagePackage: 1150000, highestPackage: 10000000, placementRate: 80, topRecruiters: ["Amazon", "Samsung", "Flipkart", "TCS"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 3800, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 1850, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 3200, maxRank: 7000, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 6500, maxRank: 10500, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Palakkad",
    slug: "iit-palakkad",
    location: "Kanjikode, Palakkad, Kerala",
    city: "Palakkad",
    state: "Kerala",
    fees: 220000,
    rating: 4.0,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2015,
    website: "https://www.iitpkd.ac.in",
    nirfRank: 45,
    campusSize: "500 acres",
    totalStudents: 1200,
    totalFaculty: 100,
    studentFacultyRatio: "12:1",
    overview: "Indian Institute of Technology Palakkad is mentored by IIT Madras and is located in the scenic Western Ghats of Kerala. The institute focuses on computational and data sciences, environmental studies and interdisciplinary research. IIT Palakkad benefits from its mentor IIT's academic framework and faculty support.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 40, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1200000, highestPackage: 11000000, placementRate: 80, topRecruiters: ["Amazon", "Samsung", "Flipkart", "TCS", "Infosys"] },
      { year: 2023, averagePackage: 1080000, highestPackage: 9000000, placementRate: 78, topRecruiters: ["Amazon", "Samsung", "TCS", "Infosys"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 4500, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 2200, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 3800, maxRank: 7800, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 7200, maxRank: 11500, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Jammu",
    slug: "iit-jammu",
    location: "Jagti, Nagrota, Jammu",
    city: "Jammu",
    state: "Jammu and Kashmir",
    fees: 220000,
    rating: 3.9,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2016,
    website: "https://www.iitjammu.ac.in",
    nirfRank: 57,
    campusSize: "470 acres",
    totalStudents: 1100,
    totalFaculty: 90,
    studentFacultyRatio: "12:1",
    overview: "Indian Institute of Technology Jammu is one of the newest IITs, located in the foothills of the Shivalik range. The institute focuses on smart manufacturing, cyber-physical systems and sustainable development. IIT Jammu is developing rapidly with new academic departments and research facilities.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1100000, highestPackage: 10000000, placementRate: 78, topRecruiters: ["Amazon", "Samsung", "Flipkart", "TCS", "Infosys"] },
      { year: 2023, averagePackage: 980000, highestPackage: 8500000, placementRate: 75, topRecruiters: ["Amazon", "Samsung", "TCS", "Infosys"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 5000, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 2400, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 4200, maxRank: 8500, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 8000, maxRank: 12500, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Goa",
    slug: "iit-goa",
    location: "Farmagudi, Ponda, Goa",
    city: "Goa",
    state: "Goa",
    fees: 220000,
    rating: 3.9,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2016,
    website: "https://www.iitgoa.ac.in",
    nirfRank: 62,
    campusSize: "320 acres",
    totalStudents: 900,
    totalFaculty: 75,
    studentFacultyRatio: "12:1",
    overview: "Indian Institute of Technology Goa is mentored by IIT Bombay and benefits from its academic framework. Located in the scenic state of Goa, the institute offers programs in computer science, electrical and mechanical engineering. IIT Goa is developing its permanent campus with focus on marine engineering and data science research.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Mathematics and Computing", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1080000, highestPackage: 9500000, placementRate: 77, topRecruiters: ["Amazon", "Samsung", "Flipkart", "TCS", "Infosys"] },
      { year: 2023, averagePackage: 950000, highestPackage: 8000000, placementRate: 74, topRecruiters: ["Amazon", "TCS", "Infosys", "Wipro"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 4800, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 2350, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 4000, maxRank: 8200, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 7500, maxRank: 12000, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Dharwad",
    slug: "iit-dharwad",
    location: "WALMI Campus, Dharwad, Karnataka",
    city: "Dharwad",
    state: "Karnataka",
    fees: 220000,
    rating: 3.8,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2016,
    website: "https://www.iitdh.ac.in",
    nirfRank: 67,
    campusSize: "470 acres",
    totalStudents: 800,
    totalFaculty: 65,
    studentFacultyRatio: "12:1",
    overview: "Indian Institute of Technology Dharwad is mentored by IIT Bombay and is one of the newest IITs. Located in North Karnataka, the institute is developing its campus with modern infrastructure. IIT Dharwad focuses on advanced manufacturing, computational sciences and environmental engineering research.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1050000, highestPackage: 9000000, placementRate: 75, topRecruiters: ["Amazon", "Samsung", "TCS", "Infosys", "Wipro"] },
      { year: 2023, averagePackage: 920000, highestPackage: 7500000, placementRate: 72, topRecruiters: ["Amazon", "TCS", "Infosys", "Wipro"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 5200, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 2550, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 4500, maxRank: 8800, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 8200, maxRank: 12800, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "Indian Institute of Technology Bhilai",
    slug: "iit-bhilai",
    location: "GEC Campus, Sejbahar, Raipur, Chhattisgarh",
    city: "Raipur",
    state: "Chhattisgarh",
    fees: 220000,
    rating: 3.9,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A",
    established: 2016,
    website: "https://www.iitbhilai.ac.in",
    nirfRank: 55,
    campusSize: "300 acres",
    totalStudents: 950,
    totalFaculty: 80,
    studentFacultyRatio: "12:1",
    overview: "Indian Institute of Technology Bhilai is mentored by IIT Hyderabad and is rapidly growing. The institute focuses on VLSI design, data science and mechatronics. IIT Bhilai has a strong emphasis on entrepreneurship and innovation with its incubation centre supporting startups.",
    examAccepted: [ExamType.JEE_ADVANCED],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 220000, seats: 35, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 30, degree: "B.Tech" },
      { name: "B.Tech Mechatronics Engineering", duration: "4 years", fees: 220000, seats: 25, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1120000, highestPackage: 10500000, placementRate: 79, topRecruiters: ["Amazon", "Samsung", "Flipkart", "TCS", "Infosys"] },
      { year: 2023, averagePackage: 1000000, highestPackage: 9000000, placementRate: 76, topRecruiters: ["Amazon", "Samsung", "TCS", "Infosys"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 4600, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 2250, course: "Computer Science and Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 3800, maxRank: 8000, course: "Electrical Engineering", quota: "AI", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 7500, maxRank: 12000, course: "Mechanical Engineering", quota: "AI", gender: "Gender-Neutral" },
    ],
  },
]

// ─── NIT DATA (31 NITs) ─────────────────────────────────────────────────────
// Data sourced from: JoSAA 2024 Round 6 closing ranks (Other State quota), NIRF 2024

const nitColleges: CollegeSeed[] = [
  {
    name: "National Institute of Technology Tiruchirappalli",
    slug: "nit-trichy",
    location: "Thuvakudi, Tiruchirappalli, Tamil Nadu",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    fees: 167700,
    rating: 4.5,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1964,
    website: "https://www.nitt.edu",
    nirfRank: 9,
    campusSize: "800 acres",
    totalStudents: 7500,
    totalFaculty: 450,
    studentFacultyRatio: "17:1",
    overview: "National Institute of Technology Tiruchirappalli is the top-ranked NIT in India, consistently ranked in the top 10 engineering colleges. Established in 1964, NIT Trichy is known for its excellent academic programs, strong placement records and vibrant campus life. The institute organizes Pragyan, one of the largest techno-management fests in South India.",
    examAccepted: [ExamType.JEE_MAIN],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 167700, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", fees: 167700, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electrical and Electronics Engineering", duration: "4 years", fees: 167700, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 167700, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 167700, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 167700, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Instrumentation and Control Engineering", duration: "4 years", fees: 167700, seats: 62, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1650000, highestPackage: 15000000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Amazon", "Intel", "Qualcomm", "Cisco", "Oracle"] },
      { year: 2023, averagePackage: 1480000, highestPackage: 12000000, placementRate: 93, topRecruiters: ["Microsoft", "Amazon", "Intel", "Texas Instruments", "Qualcomm"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 100, maxRank: 4500, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.OBC, minRank: 100, maxRank: 2200, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.SC, minRank: 100, maxRank: 1100, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.ST, minRank: 50, maxRank: 500, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.EWS, minRank: 100, maxRank: 700, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 2000, maxRank: 9500, course: "Electronics and Communication Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 5000, maxRank: 14000, course: "Electrical and Electronics Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 9000, maxRank: 22000, course: "Mechanical Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 15000, maxRank: 32000, course: "Civil Engineering", quota: "OS", gender: "Gender-Neutral" },
      // Home State quota
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 500, maxRank: 7500, course: "Computer Science and Engineering", quota: "HS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2023, category: Category.GENERAL, minRank: 100, maxRank: 4800, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "National Institute of Technology Karnataka Surathkal",
    slug: "nit-surathkal",
    location: "Surathkal, Mangalore, Karnataka",
    city: "Mangalore",
    state: "Karnataka",
    fees: 165000,
    rating: 4.4,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1960,
    website: "https://www.nitk.ac.in",
    nirfRank: 10,
    campusSize: "295 acres",
    totalStudents: 6200,
    totalFaculty: 380,
    studentFacultyRatio: "16:1",
    overview: "National Institute of Technology Karnataka (NITK) Surathkal is one of the premier NITs, beautifully located on the Arabian Sea coast. Known for its scenic beachside campus, strong academic programs and excellent placements, NITK Surathkal hosts Engineer, one of the largest student-organized techno-cultural fests in India.",
    examAccepted: [ExamType.JEE_MAIN],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 165000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", fees: 165000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electrical and Electronics Engineering", duration: "4 years", fees: 165000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 165000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 165000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 165000, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Information Technology", duration: "4 years", fees: 165000, seats: 62, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1580000, highestPackage: 14000000, placementRate: 94, topRecruiters: ["Google", "Microsoft", "Amazon", "Intel", "Qualcomm", "Cisco", "Samsung"] },
      { year: 2023, averagePackage: 1420000, highestPackage: 12000000, placementRate: 92, topRecruiters: ["Microsoft", "Amazon", "Intel", "Texas Instruments", "Samsung"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 100, maxRank: 5500, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.OBC, minRank: 100, maxRank: 2700, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.SC, minRank: 100, maxRank: 1300, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 3000, maxRank: 12000, course: "Electronics and Communication Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 8000, maxRank: 18000, course: "Electrical and Electronics Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 12000, maxRank: 26000, course: "Mechanical Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 800, maxRank: 8500, course: "Computer Science and Engineering", quota: "HS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2023, category: Category.GENERAL, minRank: 100, maxRank: 5800, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "National Institute of Technology Warangal",
    slug: "nit-warangal",
    location: "Hanamkonda, Warangal, Telangana",
    city: "Warangal",
    state: "Telangana",
    fees: 155000,
    rating: 4.4,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A++",
    established: 1959,
    website: "https://www.nitw.ac.in",
    nirfRank: 12,
    campusSize: "248 acres",
    totalStudents: 6500,
    totalFaculty: 400,
    studentFacultyRatio: "16:1",
    overview: "National Institute of Technology Warangal is one of the oldest NITs, established in 1959. Known for its strong academic programs, excellent research output and consistent top NIRF rankings. NIT Warangal has a vibrant campus life with notable cultural events and student-run organizations.",
    examAccepted: [ExamType.JEE_MAIN],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 155000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", fees: 155000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electrical and Electronics Engineering", duration: "4 years", fees: 155000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 155000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 155000, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 155000, seats: 62, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1520000, highestPackage: 13500000, placementRate: 93, topRecruiters: ["Google", "Microsoft", "Amazon", "Qualcomm", "Cisco", "Intel", "Samsung"] },
      { year: 2023, averagePackage: 1380000, highestPackage: 11000000, placementRate: 91, topRecruiters: ["Microsoft", "Amazon", "Flipkart", "Qualcomm", "Samsung"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 100, maxRank: 6000, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.OBC, minRank: 100, maxRank: 2900, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 3500, maxRank: 14000, course: "Electronics and Communication Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 10000, maxRank: 25000, course: "Mechanical Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 1000, maxRank: 10000, course: "Computer Science and Engineering", quota: "HS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2023, category: Category.GENERAL, minRank: 100, maxRank: 6500, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "National Institute of Technology Calicut",
    slug: "nit-calicut",
    location: "Chathamangalam, Kozhikode, Kerala",
    city: "Kozhikode",
    state: "Kerala",
    fees: 135000,
    rating: 4.3,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A+",
    established: 1961,
    website: "https://www.nitc.ac.in",
    nirfRank: 16,
    campusSize: "120 acres",
    totalStudents: 5800,
    totalFaculty: 320,
    studentFacultyRatio: "18:1",
    overview: "National Institute of Technology Calicut is a premier NIT located in the scenic hills of Kozhikode, Kerala. Established in 1961, NIT Calicut is known for its lush green campus, strong academic programs and excellent placement records. The institute has a strong research focus in areas like cyber security, renewable energy and advanced materials.",
    examAccepted: [ExamType.JEE_MAIN],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 135000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", fees: 135000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electrical and Electronics Engineering", duration: "4 years", fees: 135000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 135000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 135000, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Chemical Engineering", duration: "4 years", fees: 135000, seats: 62, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1420000, highestPackage: 12000000, placementRate: 92, topRecruiters: ["Microsoft", "Amazon", "Oracle", "Intel", "Samsung", "Cisco"] },
      { year: 2023, averagePackage: 1280000, highestPackage: 10000000, placementRate: 90, topRecruiters: ["Amazon", "Oracle", "Intel", "Samsung", "Cisco"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 200, maxRank: 9000, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.OBC, minRank: 200, maxRank: 4200, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 5000, maxRank: 17000, course: "Electronics and Communication Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 13000, maxRank: 28000, course: "Mechanical Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2023, category: Category.GENERAL, minRank: 200, maxRank: 9500, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
    ],
  },
  {
    name: "National Institute of Technology Rourkela",
    slug: "nit-rourkela",
    location: "Rourkela, Odisha",
    city: "Rourkela",
    state: "Odisha",
    fees: 152000,
    rating: 4.3,
    type: CollegeType.GOVERNMENT,
    accreditation: "NAAC A+",
    established: 1961,
    website: "https://www.nitrkl.ac.in",
    nirfRank: 14,
    campusSize: "640 acres",
    totalStudents: 6800,
    totalFaculty: 400,
    studentFacultyRatio: "17:1",
    overview: "National Institute of Technology Rourkela, spread over 640 acres, is one of the top NITs in India. Known for its strong metallurgical and mining engineering programs, NIT Rourkela has excellent research facilities and a beautiful green campus. The institute has strong ties with industries like Tata Steel and NALCO.",
    examAccepted: [ExamType.JEE_MAIN],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees: 152000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", fees: 152000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 152000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 152000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees: 152000, seats: 93, degree: "B.Tech" },
      { name: "B.Tech Metallurgical and Materials Engineering", duration: "4 years", fees: 152000, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Mining Engineering", duration: "4 years", fees: 152000, seats: 62, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: 1450000, highestPackage: 12500000, placementRate: 92, topRecruiters: ["Microsoft", "Amazon", "Samsung", "Tata Steel", "Intel", "Oracle", "Goldman Sachs"] },
      { year: 2023, averagePackage: 1300000, highestPackage: 10500000, placementRate: 90, topRecruiters: ["Amazon", "Samsung", "Tata Steel", "Oracle", "Intel"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 200, maxRank: 8500, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.OBC, minRank: 200, maxRank: 4000, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 5000, maxRank: 16000, course: "Electronics and Communication Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 12000, maxRank: 28000, course: "Mechanical Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2023, category: Category.GENERAL, minRank: 200, maxRank: 9000, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
    ],
  },
  // Remaining NITs with more concise data
  ...generateRemainingNITs(),
]

// ─── Helper to generate remaining NITs ───────────────────────────────────────

function generateRemainingNITs(): CollegeSeed[] {
  const nits: CollegeSeed[] = [
    mkNIT("Malaviya National Institute of Technology Jaipur", "mnit-jaipur", "Jaipur", "Rajasthan", 148000, 4.2, 1963, 17, "https://www.mnit.ac.in", "NAAC A+", "300 acres", 5500, 340, "Malaviya National Institute of Technology Jaipur is a premier engineering institution in Rajasthan known for its strong academic tradition and excellent placement records. MNIT Jaipur offers a wide range of engineering programs with modern facilities and experienced faculty.", 1450000, 12000000, 91, 7500, 15000, 25000),
    mkNIT("Motilal Nehru National Institute of Technology Allahabad", "mnnit-allahabad", "Prayagraj", "Uttar Pradesh", 143000, 4.2, 1961, 18, "https://www.mnnit.ac.in", "NAAC A+", "222 acres", 5200, 300, "Motilal Nehru National Institute of Technology Allahabad is one of the leading NITs with a strong reputation in electrical and computer science engineering. Located at the confluence of the Ganga and Yamuna rivers, MNNIT has a rich academic heritage.", 1380000, 11500000, 90, 8500, 16000, 27000),
    mkNIT("Visvesvaraya National Institute of Technology Nagpur", "vnit-nagpur", "Nagpur", "Maharashtra", 150000, 4.1, 1960, 19, "https://vnit.ac.in", "NAAC A+", "188 acres", 5000, 300, "Visvesvaraya National Institute of Technology Nagpur, named after Sir M. Visvesvaraya, is a top NIT known for strong engineering programs and excellent industry connections. The institute has a good track record of placements across all branches.", 1350000, 11000000, 90, 9000, 17000, 28000),
    mkNIT("Sardar Vallabhbhai National Institute of Technology Surat", "svnit-surat", "Surat", "Gujarat", 148000, 4.0, 1961, 22, "https://www.svnit.ac.in", "NAAC A+", "130 acres", 4800, 280, "Sardar Vallabhbhai National Institute of Technology Surat is a well-established NIT known for its chemical and civil engineering programs. Located in the diamond city of Surat, SVNIT benefits from strong industry partnerships.", 1300000, 10500000, 89, 10000, 18000, 30000),
    mkNIT("National Institute of Technology Durgapur", "nit-durgapur", "Durgapur", "West Bengal", 142000, 4.0, 1960, 26, "https://www.nitdgp.ac.in", "NAAC A+", "180 acres", 5500, 320, "National Institute of Technology Durgapur is one of the oldest NITs with a strong focus on engineering education and research. Located in the industrial city of Durgapur, the institute has excellent industry connections and placement records.", 1250000, 10000000, 88, 11000, 19000, 32000),
    mkNIT("National Institute of Technology Kurukshetra", "nit-kurukshetra", "Kurukshetra", "Haryana", 140000, 4.0, 1963, 28, "https://www.nitkkr.ac.in", "NAAC A+", "300 acres", 5200, 300, "National Institute of Technology Kurukshetra, located in the historic city of Kurukshetra, is a premier engineering institution in North India. Known for its strong academic programs and disciplined campus environment.", 1200000, 9500000, 87, 12000, 20000, 33000),
    mkNIT("National Institute of Technology Jamshedpur", "nit-jamshedpur", "Jamshedpur", "Jharkhand", 138000, 3.9, 1960, 30, "https://www.nitjsr.ac.in", "NAAC A", "172 acres", 4500, 270, "National Institute of Technology Jamshedpur is located in the Steel City and has strong connections with Tata Steel and other industrial giants. The institute offers quality engineering education with a focus on practical learning.", 1180000, 9000000, 86, 13000, 22000, 35000),
    mkNIT("National Institute of Technology Silchar", "nit-silchar", "Silchar", "Assam", 132000, 3.9, 1967, 32, "https://www.nits.ac.in", "NAAC A", "600 acres", 4200, 250, "National Institute of Technology Silchar is a premier NIT in Northeast India known for its large campus and strong academic programs. The institute focuses on serving the engineering education needs of the northeastern region.", 1100000, 8500000, 84, 14000, 23000, 37000),
    mkNIT("National Institute of Technology Hamirpur", "nit-hamirpur", "Hamirpur", "Himachal Pradesh", 128000, 3.8, 1986, 40, "https://www.nith.ac.in", "NAAC A", "320 acres", 3800, 220, "National Institute of Technology Hamirpur is a hilltop NIT in Himachal Pradesh known for its beautiful campus and strong CSE program. The institute provides quality engineering education in a serene mountain environment.", 1050000, 8000000, 82, 15000, 25000, 38000),
    mkNIT("National Institute of Technology Jalandhar", "nit-jalandhar", "Jalandhar", "Punjab", 130000, 3.8, 1987, 42, "https://www.nitj.ac.in", "NAAC A", "170 acres", 4000, 240, "National Institute of Technology Jalandhar, also known as Dr. B.R. Ambedkar NIT, offers quality engineering programs with good industrial exposure. Located in the vibrant city of Jalandhar in Punjab.", 1020000, 7500000, 81, 16000, 26000, 40000),
    mkNIT("National Institute of Technology Raipur", "nit-raipur", "Raipur", "Chhattisgarh", 125000, 3.7, 1956, 44, "https://www.nitrr.ac.in", "NAAC A", "100 acres", 3500, 210, "National Institute of Technology Raipur, originally established as Government Engineering College in 1956, is one of the oldest engineering institutions in Central India. The institute offers diverse engineering programs.", 980000, 7000000, 80, 17000, 28000, 42000),
    mkNIT("National Institute of Technology Patna", "nit-patna", "Patna", "Bihar", 127000, 3.7, 1886, 46, "https://www.nitp.ac.in", "NAAC A", "125 acres", 3800, 220, "National Institute of Technology Patna has a rich history dating back to 1886 when it was established as the Bihar College of Engineering. The institute offers quality engineering programs and has been growing steadily in rankings.", 960000, 7000000, 79, 18000, 29000, 43000),
    mkNIT("National Institute of Technology Srinagar", "nit-srinagar", "Srinagar", "Jammu and Kashmir", 120000, 3.6, 1960, 48, "https://www.nitsri.ac.in", "NAAC A", "60 acres", 3200, 200, "National Institute of Technology Srinagar is located in the beautiful Kashmir Valley and is the premier engineering institution in the region. The institute offers quality programs with a scenic campus environment.", 850000, 5500000, 75, 20000, 32000, 48000),
    mkNIT("National Institute of Technology Agartala", "nit-agartala", "Agartala", "Tripura", 118000, 3.5, 1965, 52, "https://www.nita.ac.in", "NAAC A", "240 acres", 3500, 200, "National Institute of Technology Agartala is a key engineering institution in Northeast India. Established in 1965, the institute offers engineering programs with focus on regional development and emerging technologies.", 780000, 5000000, 73, 25000, 38000, 55000),
    mkNIT("National Institute of Technology Delhi", "nit-delhi", "New Delhi", "Delhi", 138000, 3.9, 2010, 38, "https://www.nitdelhi.ac.in", "NAAC A", "13 acres", 1800, 120, "National Institute of Technology Delhi is the newest NIT located in the national capital. Despite being a newer institution, NIT Delhi benefits from its location in Delhi with access to major industries and tech companies.", 1150000, 9000000, 85, 14000, 24000, 36000),
    mkNIT("National Institute of Technology Goa", "nit-goa", "Goa", "Goa", 125000, 3.6, 2010, 65, "https://www.nitgoa.ac.in", "NAAC A", "100 acres", 1200, 80, "National Institute of Technology Goa is a young NIT with a growing reputation. Located in the scenic state of Goa, the institute offers quality programs in computer science, electrical and electronics engineering.", 850000, 6000000, 74, 22000, 35000, 50000),
    mkNIT("National Institute of Technology Puducherry", "nit-puducherry", "Karaikal", "Puducherry", 120000, 3.5, 2010, 68, "https://www.nitpy.ac.in", "NAAC A", "70 acres", 1100, 75, "National Institute of Technology Puducherry is situated in the coastal town of Karaikal. The institute focuses on computer science, ECE and electrical engineering programs with a growing academic and research ecosystem.", 780000, 5000000, 72, 25000, 38000, 55000),
    mkNIT("National Institute of Technology Meghalaya", "nit-meghalaya", "Shillong", "Meghalaya", 115000, 3.4, 2010, 72, "https://www.nitm.ac.in", "NAAC B++", "342 acres", 900, 65, "National Institute of Technology Meghalaya is located in the picturesque hills of Shillong. The institute offers engineering programs with focus on sustainable technology and development of the Northeast region.", 720000, 4500000, 70, 28000, 42000, 60000),
    mkNIT("National Institute of Technology Mizoram", "nit-mizoram", "Aizawl", "Mizoram", 112000, 3.3, 2010, 80, "https://www.nitmz.ac.in", "NAAC B++", "115 acres", 700, 55, "National Institute of Technology Mizoram is a growing NIT in the Northeast, offering engineering programs focused on development and technology for the region.", 680000, 4000000, 68, 32000, 48000, 65000),
    mkNIT("National Institute of Technology Nagaland", "nit-nagaland", "Dimapur", "Nagaland", 112000, 3.3, 2010, 82, "https://www.nitnagaland.ac.in", "NAAC B++", "320 acres", 650, 50, "National Institute of Technology Nagaland is developing its academic programs and infrastructure. The institute offers engineering education with a focus on the needs of Nagaland and the Northeast.", 660000, 3800000, 66, 34000, 50000, 68000),
    mkNIT("National Institute of Technology Manipur", "nit-manipur", "Imphal", "Manipur", 112000, 3.3, 2010, 83, "https://www.nitmanipur.ac.in", "NAAC B++", "365 acres", 700, 50, "National Institute of Technology Manipur offers quality engineering education in the Northeast. The institute is growing its academic programs and research capabilities.", 650000, 3500000, 65, 35000, 52000, 70000),
    mkNIT("National Institute of Technology Arunachal Pradesh", "nit-arunachal-pradesh", "Yupia", "Arunachal Pradesh", 110000, 3.3, 2010, 85, "https://www.nitap.ac.in", "NAAC B++", "207 acres", 600, 45, "National Institute of Technology Arunachal Pradesh is a developing NIT focused on serving the engineering education needs of the northeastern region.", 640000, 3500000, 64, 36000, 53000, 72000),
    mkNIT("National Institute of Technology Sikkim", "nit-sikkim", "Ravangla", "Sikkim", 110000, 3.2, 2010, 88, "https://www.nitsikkim.ac.in", "NAAC B++", "168 acres", 550, 42, "National Institute of Technology Sikkim is nestled in the Himalayan mountains, offering a unique learning environment. The institute focuses on computer science and electronics engineering programs.", 620000, 3200000, 62, 38000, 55000, 75000),
    mkNIT("National Institute of Technology Uttarakhand", "nit-uttarakhand", "Srinagar", "Uttarakhand", 118000, 3.4, 2009, 75, "https://www.nituk.ac.in", "NAAC B++", "130 acres", 800, 55, "National Institute of Technology Uttarakhand is located in the hill town of Srinagar, Uttarakhand. The institute offers engineering programs with a focus on sustainable development and mountain technologies.", 750000, 4800000, 71, 26000, 40000, 58000),
    mkNIT("National Institute of Technology Andhra Pradesh", "nit-andhra-pradesh", "Tadepalligudem", "Andhra Pradesh", 120000, 3.4, 2015, 70, "https://www.nitandhra.ac.in", "NAAC B++", "120 acres", 1000, 70, "National Institute of Technology Andhra Pradesh is a newer NIT focused on building strong engineering programs. The institute has been growing rapidly with new departments and improved infrastructure.", 800000, 5500000, 73, 24000, 36000, 52000),
  ]
  return nits
}

function mkNIT(
  name: string, slug: string, city: string, state: string,
  fees: number, rating: number, established: number, nirfRank: number,
  website: string, accreditation: string, campusSize: string,
  totalStudents: number, totalFaculty: number, overview: string,
  avgPkg: number, highPkg: number, placementRate: number,
  cseCutoff: number, eceCutoff: number, mechCutoff: number,
): CollegeSeed {
  return {
    name,
    slug,
    location: `${city}, ${state}`,
    city,
    state,
    fees,
    rating,
    type: CollegeType.GOVERNMENT,
    accreditation,
    established,
    website,
    nirfRank,
    campusSize,
    totalStudents,
    totalFaculty,
    studentFacultyRatio: `${Math.round(totalStudents / totalFaculty)}:1`,
    overview,
    examAccepted: [ExamType.JEE_MAIN],
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", fees, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", fees, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Electrical Engineering", duration: "4 years", fees, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", fees, seats: 62, degree: "B.Tech" },
      { name: "B.Tech Civil Engineering", duration: "4 years", fees, seats: 62, degree: "B.Tech" },
    ],
    placements: [
      { year: 2024, averagePackage: avgPkg, highestPackage: highPkg, placementRate, topRecruiters: ["Amazon", "Microsoft", "Samsung", "TCS", "Infosys", "Oracle"] },
      { year: 2023, averagePackage: Math.round(avgPkg * 0.9), highestPackage: Math.round(highPkg * 0.85), placementRate: placementRate - 2, topRecruiters: ["Amazon", "Samsung", "TCS", "Infosys", "Oracle"] },
    ],
    cutoffRanks: [
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 200, maxRank: cseCutoff, course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.OBC, minRank: 200, maxRank: Math.round(cseCutoff * 0.48), course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.SC, minRank: 100, maxRank: Math.round(cseCutoff * 0.25), course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.ST, minRank: 50, maxRank: Math.round(cseCutoff * 0.12), course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.EWS, minRank: 100, maxRank: Math.round(cseCutoff * 0.15), course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 1000, maxRank: eceCutoff, course: "Electronics and Communication Engineering", quota: "OS", gender: "Gender-Neutral" },
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 5000, maxRank: mechCutoff, course: "Mechanical Engineering", quota: "OS", gender: "Gender-Neutral" },
      // Home State quota (generally higher cutoffs / easier to get in)
      { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 500, maxRank: Math.round(cseCutoff * 1.6), course: "Computer Science and Engineering", quota: "HS", gender: "Gender-Neutral" },
      // Previous year
      { exam: ExamType.JEE_MAIN, year: 2023, category: Category.GENERAL, minRank: 200, maxRank: Math.round(cseCutoff * 1.05), course: "Computer Science and Engineering", quota: "OS", gender: "Gender-Neutral" },
    ],
  }
}

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────

async function main() {
  console.log("🗑️  Clearing existing data...")

  await prisma.savedComparison.deleteMany()
  await prisma.savedCollege.deleteMany()
  await prisma.review.deleteMany()
  await prisma.cutoffRank.deleteMany()
  await prisma.placement.deleteMany()
  await prisma.course.deleteMany()
  await prisma.college.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log("👤 Creating demo users...")

  const password = await bcrypt.hash("password123", 12)

  const user1 = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      password,
    },
  })

  const allColleges = [...iitColleges, ...nitColleges]

  console.log(`🏫 Seeding ${allColleges.length} colleges (${iitColleges.length} IITs + ${nitColleges.length} NITs)...`)

  for (const collegeData of allColleges) {
    const { courses, placements, cutoffRanks, ...collegeFields } = collegeData

    const college = await prisma.college.create({
      data: {
        ...collegeFields,
        reviewCount: 0,
      },
    })

    for (const course of courses) {
      await prisma.course.create({
        data: { ...course, collegeId: college.id },
      })
    }

    for (const placement of placements) {
      await prisma.placement.create({
        data: { ...placement, collegeId: college.id },
      })
    }

    for (const cutoff of cutoffRanks) {
      await prisma.cutoffRank.create({
        data: { ...cutoff, collegeId: college.id },
      })
    }

    process.stdout.write(".")
  }

  console.log("\n")

  // Add sample reviews for top colleges
  console.log("📝 Adding sample reviews...")

  const iitBombay = await prisma.college.findUnique({ where: { slug: "iit-bombay" } })
  const iitMadras = await prisma.college.findUnique({ where: { slug: "iit-madras" } })
  const nitTrichy = await prisma.college.findUnique({ where: { slug: "nit-trichy" } })

  if (iitBombay) {
    await prisma.review.create({
      data: {
        collegeId: iitBombay.id,
        userId: user1.id,
        rating: 5.0,
        title: "Best engineering college in India",
        content: "IIT Bombay offers an unparalleled academic experience with world-class faculty and cutting-edge research facilities. The campus life is vibrant with numerous festivals, clubs, and cultural events happening throughout the year. The rigorous curriculum and competitive environment truly prepare you for the challenges of the professional world.",
        pros: "World class faculty, amazing peer group, great placements, beautiful campus by Powai Lake",
        cons: "Very competitive, high pressure environment",
        batch: 2024,
      },
    })

    await prisma.review.create({
      data: {
        collegeId: iitBombay.id,
        userId: user2.id,
        rating: 4.5,
        title: "Life changing experience",
        content: "My time at IIT Bombay was truly transformative, offering exposure to cutting-edge research from the very first year. The institute provides excellent opportunities to work on funded research projects with renowned professors. The strong alumni network opened doors to amazing career opportunities both in India and abroad.",
        pros: "Excellent research opportunities, great alumni network, Techfest experience",
        cons: "Can be stressful during exam season",
        batch: 2023,
      },
    })
  }

  if (iitMadras) {
    await prisma.review.create({
      data: {
        collegeId: iitMadras.id,
        userId: user1.id,
        rating: 4.8,
        title: "India's #1 ranked institute for a reason",
        content: "IIT Madras consistently tops NIRF rankings and deservedly so. The research park, beautiful campus inside Guindy National Park, and the startup ecosystem make it a truly unique place. The faculty is extremely supportive and the academic rigor prepares you well for any career path.",
        pros: "Top NIRF rank, research park, beautiful campus with deer and monkeys, strong startup culture",
        cons: "Chennai weather can be challenging for North Indians",
        batch: 2024,
      },
    })
  }

  if (nitTrichy) {
    await prisma.review.create({
      data: {
        collegeId: nitTrichy.id,
        userId: user2.id,
        rating: 4.5,
        title: "Best NIT in India — truly worth it",
        content: "NIT Trichy is hands down the best NIT. The placement statistics speak for themselves, and the campus culture is amazing. Pragyan and Festember are world-class fests. The hostel life and friendships you make here last a lifetime. Highly recommend for JEE Main toppers.",
        pros: "Excellent placements, vibrant campus life, Pragyan fest, strong alumni network",
        cons: "Tiruchirappalli is a small town with limited entertainment options",
        batch: 2024,
      },
    })
  }

  // Update review counts
  const colleges = await prisma.college.findMany({ select: { id: true } })
  for (const college of colleges) {
    const count = await prisma.review.count({ where: { collegeId: college.id } })
    if (count > 0) {
      const avgResult = await prisma.review.aggregate({
        where: { collegeId: college.id },
        _avg: { rating: true },
      })
      await prisma.college.update({
        where: { id: college.id },
        data: {
          reviewCount: count,
          rating: avgResult._avg.rating || 0,
        },
      })
    }
  }

  const collegeCount = await prisma.college.count()
  const cutoffCount = await prisma.cutoffRank.count()
  const courseCount = await prisma.course.count()
  const userCount = await prisma.user.count()

  console.log("✅ Seed completed successfully!")
  console.log(`   📊 ${collegeCount} colleges (IITs + NITs)`)
  console.log(`   📋 ${cutoffCount} cutoff entries`)
  console.log(`   📚 ${courseCount} courses`)
  console.log(`   👤 ${userCount} users`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
