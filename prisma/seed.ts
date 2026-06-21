import { PrismaClient, CollegeType, ExamType, Category } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {

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

  const colleges = [
    {
      name: "Indian Institute of Technology Bombay",
      slug: "iit-bombay",
      location: "Powai, Mumbai, Maharashtra",
      city: "Mumbai",
      state: "Maharashtra",
      fees: 250000,
      rating: 4.8,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A++",
      established: 1958,
      overview: "Indian Institute of Technology Bombay is one of India's premier engineering institutes, known for its world-class faculty and rigorous academic programs. The campus spans over 550 acres in Powai, offering state-of-the-art research facilities and a vibrant student community. IIT Bombay consistently ranks among the top engineering institutions in Asia and has produced numerous entrepreneurs, researchers, and industry leaders.",
      examAccepted: [ExamType.JEE_ADVANCED],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 200000, seats: 120, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 200000, seats: 90, degree: "B.Tech" },
        { name: "M.Tech", duration: "2 years", fees: 25000, seats: 60, degree: "M.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 2800000, highestPackage: 25000000, placementRate: 98, topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "McKinsey", "Apple"] },
        { year: 2023, averagePackage: 2600000, highestPackage: 21000000, placementRate: 97, topRecruiters: ["Google", "Microsoft", "Amazon", "Facebook", "DE Shaw"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 100 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 150 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 300 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.ST, minRank: 1, maxRank: 400 },
        { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 120 },
      ],
    },
    {
      name: "Indian Institute of Technology Delhi",
      slug: "iit-delhi",
      location: "Hauz Khas, New Delhi",
      city: "New Delhi",
      state: "Delhi",
      fees: 230000,
      rating: 4.7,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A++",
      established: 1961,
      overview: "Indian Institute of Technology Delhi is a premier engineering institute located in the heart of the capital city. Known for its cutting-edge research and excellent faculty, IIT Delhi offers a diverse range of programs across engineering, sciences, and management. The institute has a strong industry connect and boasts one of the highest placement records in the country.",
      examAccepted: [ExamType.JEE_ADVANCED],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 230000, seats: 100, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 230000, seats: 85, degree: "B.Tech" },
        { name: "B.Tech Civil Engineering", duration: "4 years", fees: 230000, seats: 75, degree: "B.Tech" },
        { name: "M.Tech", duration: "2 years", fees: 30000, seats: 50, degree: "M.Tech" },
        { name: "MBA", duration: "2 years", fees: 450000, seats: 60, degree: "MBA" },
      ],
      placements: [
        { year: 2024, averagePackage: 2600000, highestPackage: 20000000, placementRate: 97, topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs", "Flipkart"] },
        { year: 2023, averagePackage: 2400000, highestPackage: 18000000, placementRate: 96, topRecruiters: ["Microsoft", "Amazon", "Facebook", "Uber", "DE Shaw"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 150 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 200 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 400 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.ST, minRank: 1, maxRank: 500 },
        { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 170 },
      ],
    },
    {
      name: "Indian Institute of Technology Madras",
      slug: "iit-madras",
      location: "Guindy, Chennai, Tamil Nadu",
      city: "Chennai",
      state: "Tamil Nadu",
      fees: 220000,
      rating: 4.7,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A++",
      established: 1959,
      overview: "Indian Institute of Technology Madras is renowned for its beautiful campus situated in Guindy National Park and its strong emphasis on research and innovation. The institute offers a wide array of undergraduate and postgraduate programs with a focus on interdisciplinary learning. IIT Madras has been consistently ranked among the top engineering institutions in India and has a thriving startup ecosystem.",
      examAccepted: [ExamType.JEE_ADVANCED],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 220000, seats: 100, degree: "B.Tech" },
        { name: "B.Tech Aerospace Engineering", duration: "4 years", fees: 220000, seats: 60, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 220000, seats: 80, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 2500000, highestPackage: 19000000, placementRate: 96, topRecruiters: ["Google", "Microsoft", "Amazon", "Texas Instruments", "Qualcomm"] },
        { year: 2023, averagePackage: 2300000, highestPackage: 17000000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Amazon", "Intel", "Flipkart"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 200 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 300 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 500 },
        { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 220 },
      ],
    },
    {
      name: "Indian Institute of Technology Kanpur",
      slug: "iit-kanpur",
      location: "Kalyanpur, Kanpur, Uttar Pradesh",
      city: "Kanpur",
      state: "Uttar Pradesh",
      fees: 210000,
      rating: 4.6,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A++",
      established: 1959,
      overview: "Indian Institute of Technology Kanpur is known for its strong emphasis on science and engineering education with a sprawling 1055-acre campus. The institute has pioneered several research initiatives in fields like aerospace, nuclear energy, and computer science. IIT Kanpur's alumni network includes some of the most distinguished scientists and entrepreneurs globally.",
      examAccepted: [ExamType.JEE_ADVANCED],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 210000, seats: 90, degree: "B.Tech" },
        { name: "B.Tech Electrical Engineering", duration: "4 years", fees: 210000, seats: 80, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 210000, seats: 85, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 2400000, highestPackage: 18000000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs", "Flipkart"] },
        { year: 2023, averagePackage: 2200000, highestPackage: 16000000, placementRate: 94, topRecruiters: ["Microsoft", "Amazon", "Facebook", "Uber", "Sprinklr"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 300 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.OBC, minRank: 1, maxRank: 450 },
        { exam: ExamType.JEE_ADVANCED, year: 2024, category: Category.SC, minRank: 1, maxRank: 700 },
        { exam: ExamType.JEE_ADVANCED, year: 2023, category: Category.GENERAL, minRank: 1, maxRank: 320 },
      ],
    },
    {
      name: "National Institute of Technology Trichy",
      slug: "nit-trichy",
      location: "Thuvakudi, Tiruchirappalli, Tamil Nadu",
      city: "Tiruchirappalli",
      state: "Tamil Nadu",
      fees: 180000,
      rating: 4.4,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A++",
      established: 1964,
      overview: "National Institute of Technology Tiruchirappalli is one of the oldest and most prestigious NITs in India, known for its excellent academic standards and campus life. The institute offers a wide range of engineering programs and has a strong track record of placements with top companies visiting every year. NIT Trichy is consistently ranked among the top engineering colleges in India and is known for its vibrant student community.",
      examAccepted: [ExamType.JEE_MAIN],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 180000, seats: 100, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 180000, seats: 90, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 180000, seats: 85, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 2000000, highestPackage: 12000000, placementRate: 94, topRecruiters: ["Amazon", "Microsoft", "Intel", "Qualcomm", "Cisco"] },
        { year: 2023, averagePackage: 1800000, highestPackage: 10000000, placementRate: 93, topRecruiters: ["Amazon", "Microsoft", "Intel", "Texas Instruments", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 100, maxRank: 5000 },
      ],
    },
    {
      name: "BITS Pilani",
      slug: "bits-pilani",
      location: "Vidya Vihar, Pilani, Rajasthan",
      city: "Pilani",
      state: "Rajasthan",
      fees: 550000,
      rating: 4.5,
      reviewCount: 0,
      type: CollegeType.PRIVATE,
      accreditation: "NAAC A",
      established: 1964,
      overview: "Birla Institute of Technology and Science, Pilani is a premier private engineering institute known for its rigorous academic curriculum and flexible degree structure. The institute offers a unique Practice School program that integrates industry experience with academic learning. BITS Pilani has a strong alumni network and is known for its high placement statistics across all branches.",
      examAccepted: [ExamType.JEE_MAIN],
      courses: [
        { name: "B.E. Computer Science", duration: "4 years", fees: 550000, seats: 150, degree: "B.E." },
        { name: "B.E. Electronics", duration: "4 years", fees: 550000, seats: 120, degree: "B.E." },
        { name: "B.E. Mechanical Engineering", duration: "4 years", fees: 550000, seats: 100, degree: "B.E." },
        { name: "M.Sc. Mathematics", duration: "3 years", fees: 350000, seats: 40, degree: "M.Sc." },
      ],
      placements: [
        { year: 2024, averagePackage: 2500000, highestPackage: 18000000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs", "DE Shaw"] },
        { year: 2023, averagePackage: 2300000, highestPackage: 15000000, placementRate: 94, topRecruiters: ["Microsoft", "Amazon", "Facebook", "Uber", "Sprinklr"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 1000, maxRank: 8000 },
      ],
    },
    {
      name: "Vellore Institute of Technology",
      slug: "vit-vellore",
      location: "Vellore, Tamil Nadu",
      city: "Vellore",
      state: "Tamil Nadu",
      fees: 420000,
      rating: 4.1,
      reviewCount: 0,
      type: CollegeType.PRIVATE,
      accreditation: "NAAC A++",
      established: 1984,
      overview: "Vellore Institute of Technology is a renowned private engineering institution known for its world-class infrastructure and international collaborations. The institute offers a wide range of undergraduate and postgraduate programs with a strong focus on research and innovation. VIT's flexible academic system and industry-oriented curriculum attract students from across the country.",
      examAccepted: [ExamType.JEE_MAIN, ExamType.STATE_CET],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 420000, seats: 300, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 420000, seats: 200, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 420000, seats: 150, degree: "B.Tech" },
        { name: "B.Tech Biotechnology", duration: "4 years", fees: 420000, seats: 60, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 1200000, highestPackage: 8000000, placementRate: 90, topRecruiters: ["Amazon", "Microsoft", "Cognizant", "Infosys", "Wipro"] },
        { year: 2023, averagePackage: 1100000, highestPackage: 7000000, placementRate: 88, topRecruiters: ["Amazon", "Cognizant", "Infosys", "TCS", "Wipro"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 10000, maxRank: 50000 },
      ],
    },
    {
      name: "Delhi Technological University",
      slug: "dtu-delhi",
      location: "Shahbad Daulatpur, Rohini, New Delhi",
      city: "New Delhi",
      state: "Delhi",
      fees: 160000,
      rating: 4.2,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A",
      established: 1941,
      overview: "Delhi Technological University, formerly Delhi College of Engineering, is one of India's oldest engineering institutions with a rich legacy of academic excellence. The university offers a wide range of engineering programs and has modern laboratories and research facilities. DTU has strong industry connections and consistently achieves excellent placement results across all branches.",
      examAccepted: [ExamType.JEE_MAIN],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 160000, seats: 120, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 160000, seats: 90, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 160000, seats: 80, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 1900000, highestPackage: 12000000, placementRate: 93, topRecruiters: ["Amazon", "Microsoft", "Google", "Goldman Sachs", "Sprinklr"] },
        { year: 2023, averagePackage: 1700000, highestPackage: 10000000, placementRate: 92, topRecruiters: ["Amazon", "Microsoft", "Flipkart", "Uber", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 500, maxRank: 15000 },
      ],
    },
    {
      name: "Manipal Institute of Technology",
      slug: "mit-manipal",
      location: "Manipal, Karnataka",
      city: "Manipal",
      state: "Karnataka",
      fees: 480000,
      rating: 4.0,
      reviewCount: 0,
      type: CollegeType.PRIVATE,
      accreditation: "NAAC A+",
      established: 1957,
      overview: "Manipal Institute of Technology is one of India's premier private engineering colleges located in the picturesque university town of Manipal. The institute offers a diverse range of programs with a strong emphasis on holistic education and global exposure. MIT Manipal has a vibrant campus life with numerous student-run clubs and organizations.",
      examAccepted: [ExamType.JEE_MAIN, ExamType.STATE_CET],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 480000, seats: 200, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 480000, seats: 120, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 480000, seats: 100, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 1400000, highestPackage: 9000000, placementRate: 91, topRecruiters: ["Amazon", "Microsoft", "Dell", "Cognizant", "Infosys"] },
        { year: 2023, averagePackage: 1300000, highestPackage: 7500000, placementRate: 90, topRecruiters: ["Amazon", "Microsoft", "Dell", "IBM", "Infosys"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 15000, maxRank: 60000 },
      ],
    },
    {
      name: "SRM Institute of Science and Technology",
      slug: "srm-kattankulathur",
      location: "Kattankulathur, Tamil Nadu",
      city: "Kattankulathur",
      state: "Tamil Nadu",
      fees: 380000,
      rating: 3.8,
      reviewCount: 0,
      type: CollegeType.PRIVATE,
      accreditation: "NAAC A++",
      established: 1985,
      overview: "SRM Institute of Science and Technology is a large private university offering a wide range of engineering programs with excellent infrastructure and facilities. The institute has a strong focus on research and international collaborations with universities worldwide. SRM's sprawling campus and diverse student community make it one of the most sought-after private engineering institutions.",
      examAccepted: [ExamType.JEE_MAIN, ExamType.STATE_CET],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 380000, seats: 400, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 380000, seats: 250, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 380000, seats: 150, degree: "B.Tech" },
        { name: "B.Tech Artificial Intelligence", duration: "4 years", fees: 420000, seats: 120, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 900000, highestPackage: 6000000, placementRate: 87, topRecruiters: ["Amazon", "Cognizant", "Infosys", "TCS", "Wipro"] },
        { year: 2023, averagePackage: 800000, highestPackage: 5000000, placementRate: 85, topRecruiters: ["Cognizant", "Infosys", "TCS", "Wipro", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 30000, maxRank: 100000 },
      ],
    },
    {
      name: "Indian Institute of Management Ahmedabad",
      slug: "iim-ahmedabad",
      location: "Vastrapur, Ahmedabad, Gujarat",
      city: "Ahmedabad",
      state: "Gujarat",
      fees: 2500000,
      rating: 4.9,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A+",
      established: 1961,
      overview: "Indian Institute of Management Ahmedabad is the premier management institute in India, renowned for its rigorous academic curriculum and distinguished faculty. The institute's case-based teaching methodology and focus on leadership development have produced some of the finest business leaders in the country. IIM Ahmedabad consistently ranks among the top business schools globally and offers unparalleled placement opportunities.",
      examAccepted: [ExamType.CAT],
      courses: [
        { name: "MBA", duration: "2 years", fees: 2500000, seats: 385, degree: "MBA" },
        { name: "PGPX", duration: "1 year", fees: 3000000, seats: 120, degree: "PGPX" },
      ],
      placements: [
        { year: 2024, averagePackage: 3500000, highestPackage: 12000000, placementRate: 100, topRecruiters: ["McKinsey", "BCG", "Bain", "Goldman Sachs", "Amazon"] },
        { year: 2023, averagePackage: 3200000, highestPackage: 11000000, placementRate: 100, topRecruiters: ["McKinsey", "BCG", "Bain", "Goldman Sachs", "Flipkart"] },
      ],
      cutoffRanks: [
        { exam: ExamType.CAT, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 100 },
      ],
    },
    {
      name: "Indian Institute of Management Bangalore",
      slug: "iim-bangalore",
      location: "Bannerghatta Road, Bangalore, Karnataka",
      city: "Bangalore",
      state: "Karnataka",
      fees: 2300000,
      rating: 4.8,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A+",
      established: 1973,
      overview: "Indian Institute of Management Bangalore is one of India's top business schools, known for its world-class faculty and innovative curriculum. The institute's 100-acre campus in the garden city provides an ideal environment for learning and personal growth. IIM Bangalore has a strong focus on entrepreneurship and social impact, with numerous student-led initiatives.",
      examAccepted: [ExamType.CAT],
      courses: [
        { name: "MBA", duration: "2 years", fees: 2300000, seats: 420, degree: "MBA" },
        { name: "Executive MBA", duration: "1 year", fees: 2800000, seats: 80, degree: "EMBA" },
      ],
      placements: [
        { year: 2024, averagePackage: 3200000, highestPackage: 10000000, placementRate: 100, topRecruiters: ["BCG", "McKinsey", "Bain", "Amazon", "Goldman Sachs"] },
        { year: 2023, averagePackage: 3000000, highestPackage: 9500000, placementRate: 100, topRecruiters: ["McKinsey", "BCG", "Bain", "Google", "Microsoft"] },
      ],
      cutoffRanks: [
        { exam: ExamType.CAT, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 150 },
      ],
    },
    {
      name: "AIIMS New Delhi",
      slug: "aiims-delhi",
      location: "Ansari Nagar, New Delhi",
      city: "New Delhi",
      state: "Delhi",
      fees: 7000,
      rating: 4.9,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A+",
      established: 1956,
      overview: "All India Institute of Medical Sciences, New Delhi is the country's premier medical institution, known for its excellence in medical education, research, and patient care. The institute offers some of the most competitive medical programs in India with negligible tuition fees compared to private colleges. AIIMS Delhi consistently ranks as the top medical college in India and produces some of the finest doctors and medical researchers.",
      examAccepted: [ExamType.NEET],
      courses: [
        { name: "MBBS", duration: "5.5 years", fees: 7000, seats: 107, degree: "MBBS" },
        { name: "MD Medicine", duration: "3 years", fees: 10000, seats: 50, degree: "MD" },
        { name: "MS Surgery", duration: "3 years", fees: 10000, seats: 40, degree: "MS" },
      ],
      placements: [
        { year: 2024, averagePackage: 1800000, highestPackage: 8000000, placementRate: 100, topRecruiters: ["AIIMS", "Apollo", "Fortis", "Max Healthcare"] },
      ],
      cutoffRanks: [
        { exam: ExamType.NEET, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 50 },
      ],
    },
    {
      name: "Maulana Azad Medical College",
      slug: "mamc-delhi",
      location: "Bahadur Shah Zafar Marg, New Delhi",
      city: "New Delhi",
      state: "Delhi",
      fees: 15000,
      rating: 4.5,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A",
      established: 1959,
      overview: "Maulana Azad Medical College is one of the oldest and most prestigious medical colleges in India, affiliated with the University of Delhi. The college provides comprehensive medical education and training with access to some of the largest hospitals in Delhi. MAMC has a strong reputation for producing skilled medical professionals who serve across the country.",
      examAccepted: [ExamType.NEET],
      courses: [
        { name: "MBBS", duration: "5.5 years", fees: 15000, seats: 200, degree: "MBBS" },
        { name: "MD Medicine", duration: "3 years", fees: 18000, seats: 60, degree: "MD" },
      ],
      placements: [
        { year: 2024, averagePackage: 1200000, highestPackage: 5000000, placementRate: 98, topRecruiters: ["AIIMS", "Apollo", "Fortis", "Max Healthcare", "Sir Ganga Ram"] },
      ],
      cutoffRanks: [
        { exam: ExamType.NEET, year: 2024, category: Category.GENERAL, minRank: 50, maxRank: 500 },
      ],
    },
    {
      name: "National Law School of India University",
      slug: "nlsiu-bangalore",
      location: "Nagarbhavi, Bangalore, Karnataka",
      city: "Bangalore",
      state: "Karnataka",
      fees: 350000,
      rating: 4.7,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A",
      established: 1987,
      overview: "National Law School of India University is the premier law university in India, known for its rigorous academic programs and distinguished faculty. The institution pioneered the five-year integrated law degree in India and continues to set benchmarks for legal education. NLSIU Bangalore boasts an impressive alumni network including Supreme Court judges, top lawyers, and legal scholars.",
      examAccepted: [ExamType.CLAT],
      courses: [
        { name: "BA LLB", duration: "5 years", fees: 350000, seats: 200, degree: "BA LLB" },
        { name: "LLM", duration: "1 year", fees: 250000, seats: 60, degree: "LLM" },
      ],
      placements: [
        { year: 2024, averagePackage: 1800000, highestPackage: 7000000, placementRate: 95, topRecruiters: ["AZB & Partners", "Cyril Amarchand", "Shardul Amarchand", "Khaitan & Co", "Samvad Partners"] },
        { year: 2023, averagePackage: 1600000, highestPackage: 6000000, placementRate: 94, topRecruiters: ["AZB & Partners", "Cyril Amarchand", "Shardul Amarchand", "Trilegal", "JSA"] },
      ],
      cutoffRanks: [
        { exam: ExamType.CLAT, year: 2024, category: Category.GENERAL, minRank: 1, maxRank: 100 },
      ],
    },
    {
      name: "NIT Surathkal",
      slug: "nit-surathkal",
      location: "Surathkal, Mangalore, Karnataka",
      city: "Surathkal",
      state: "Karnataka",
      fees: 175000,
      rating: 4.3,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A++",
      established: 1960,
      overview: "National Institute of Technology Karnataka, Surathkal is a premier engineering institute located on the scenic coast of Karnataka. The institute offers excellent academic programs with state-of-the-art research facilities and a strong focus on industry collaboration. NIT Surathkal is known for its beautiful beachside campus and high placement records.",
      examAccepted: [ExamType.JEE_MAIN],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 175000, seats: 90, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 175000, seats: 80, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 175000, seats: 85, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 1800000, highestPackage: 10000000, placementRate: 93, topRecruiters: ["Amazon", "Microsoft", "Intel", "Qualcomm", "Cisco"] },
        { year: 2023, averagePackage: 1600000, highestPackage: 8500000, placementRate: 92, topRecruiters: ["Amazon", "Microsoft", "Intel", "Texas Instruments", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 2000, maxRank: 12000 },
      ],
    },
    {
      name: "NIT Warangal",
      slug: "nit-warangal",
      location: "Hanamkonda, Warangal, Telangana",
      city: "Warangal",
      state: "Telangana",
      fees: 170000,
      rating: 4.3,
      reviewCount: 0,
      type: CollegeType.GOVERNMENT,
      accreditation: "NAAC A++",
      established: 1959,
      overview: "National Institute of Technology Warangal is one of the oldest engineering colleges in India with a rich history dating back to 1959. The institute offers a wide range of engineering programs and has excellent research infrastructure with multiple centers of excellence. NIT Warangal has a strong alumni network and consistently achieves top rankings among NITs.",
      examAccepted: [ExamType.JEE_MAIN],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 170000, seats: 90, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 170000, seats: 80, degree: "B.Tech" },
        { name: "B.Tech Civil Engineering", duration: "4 years", fees: 170000, seats: 75, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 1700000, highestPackage: 9500000, placementRate: 92, topRecruiters: ["Amazon", "Microsoft", "Intel", "Qualcomm", "Cisco"] },
        { year: 2023, averagePackage: 1500000, highestPackage: 8000000, placementRate: 91, topRecruiters: ["Amazon", "Microsoft", "Flipkart", "Texas Instruments", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 3000, maxRank: 14000 },
      ],
    },
    {
      name: "PSG College of Technology",
      slug: "psg-tech-coimbatore",
      location: "Peelamedu, Coimbatore, Tamil Nadu",
      city: "Coimbatore",
      state: "Tamil Nadu",
      fees: 120000,
      rating: 4.0,
      reviewCount: 0,
      type: CollegeType.AUTONOMOUS,
      accreditation: "NAAC A+",
      established: 1951,
      overview: "PSG College of Technology is one of India's oldest and most respected engineering institutions, known for its academic excellence and industry partnerships. The college offers a range of undergraduate and postgraduate programs with a strong emphasis on practical learning and research. PSG Tech has a serene campus and a long-standing reputation for producing skilled engineers.",
      examAccepted: [ExamType.JEE_MAIN, ExamType.STATE_CET],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 120000, seats: 100, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 120000, seats: 80, degree: "B.Tech" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", fees: 120000, seats: 90, degree: "B.Tech" },
      ],
      placements: [
        { year: 2024, averagePackage: 1100000, highestPackage: 7000000, placementRate: 90, topRecruiters: ["Amazon", "Cognizant", "Infosys", "Bosch", "L&T"] },
        { year: 2023, averagePackage: 1000000, highestPackage: 6000000, placementRate: 89, topRecruiters: ["Amazon", "Cognizant", "Bosch", "L&T", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 15000, maxRank: 60000 },
      ],
    },
    {
      name: "Amity University Noida",
      slug: "amity-noida",
      location: "Sector 125, Noida, Uttar Pradesh",
      city: "Noida",
      state: "Uttar Pradesh",
      fees: 350000,
      rating: 3.6,
      reviewCount: 0,
      type: CollegeType.PRIVATE,
      accreditation: "NAAC A+",
      established: 2003,
      overview: "Amity University Noida is a large private university offering a comprehensive range of programs across engineering, management, and sciences. The university boasts world-class infrastructure with modern classrooms, well-equipped laboratories, and extensive sports facilities. Amity has a strong focus on holistic development and provides ample opportunities for extracurricular activities.",
      examAccepted: [ExamType.JEE_MAIN, ExamType.STATE_CET],
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", fees: 350000, seats: 300, degree: "B.Tech" },
        { name: "B.Tech Electronics", duration: "4 years", fees: 350000, seats: 150, degree: "B.Tech" },
        { name: "BBA", duration: "3 years", fees: 250000, seats: 200, degree: "BBA" },
        { name: "BA LLB", duration: "5 years", fees: 300000, seats: 100, degree: "BA LLB" },
      ],
      placements: [
        { year: 2024, averagePackage: 700000, highestPackage: 4000000, placementRate: 82, topRecruiters: ["Amazon", "Cognizant", "Infosys", "TCS", "Wipro"] },
        { year: 2023, averagePackage: 650000, highestPackage: 3500000, placementRate: 80, topRecruiters: ["Cognizant", "Infosys", "TCS", "Wipro", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 50000, maxRank: 150000 },
      ],
    },
    {
      name: "Thapar Institute of Engineering",
      slug: "thapar-patiala",
      location: "Patiala, Punjab",
      city: "Patiala",
      state: "Punjab",
      fees: 420000,
      rating: 4.1,
      reviewCount: 0,
      type: CollegeType.DEEMED,
      accreditation: "NAAC A+",
      established: 1956,
      overview: "Thapar Institute of Engineering and Technology is a deemed university with a strong reputation for engineering education and research in North India. The institute offers a wide range of programs with modern infrastructure and experienced faculty. Thapar has robust industry connections and consistently achieves good placement results across all departments.",
      examAccepted: [ExamType.JEE_MAIN],
      courses: [
        { name: "B.E. Computer Science", duration: "4 years", fees: 420000, seats: 150, degree: "B.E." },
        { name: "B.E. Electronics", duration: "4 years", fees: 420000, seats: 100, degree: "B.E." },
        { name: "B.E. Mechanical Engineering", duration: "4 years", fees: 420000, seats: 120, degree: "B.E." },
      ],
      placements: [
        { year: 2024, averagePackage: 1100000, highestPackage: 7000000, placementRate: 88, topRecruiters: ["Amazon", "Microsoft", "Cognizant", "Infosys", "L&T"] },
        { year: 2023, averagePackage: 1000000, highestPackage: 6000000, placementRate: 86, topRecruiters: ["Amazon", "Cognizant", "Infosys", "TCS", "Accenture"] },
      ],
      cutoffRanks: [
        { exam: ExamType.JEE_MAIN, year: 2024, category: Category.GENERAL, minRank: 8000, maxRank: 35000 },
      ],
    },
  ]

  for (const collegeData of colleges) {
    const { courses, placements, cutoffRanks, ...collegeFields } = collegeData

    const college = await prisma.college.create({
      data: collegeFields,
    })

    for (const course of courses) {
      await prisma.course.create({
        data: {
          ...course,
          collegeId: college.id,
        },
      })
    }

    for (const placement of placements) {
      await prisma.placement.create({
        data: {
          ...placement,
          collegeId: college.id,
        },
      })
    }

    for (const cutoff of cutoffRanks) {
      await prisma.cutoffRank.create({
        data: {
          ...cutoff,
          collegeId: college.id,
        },
      })
    }
  }

  await prisma.review.create({
    data: {
      collegeId: (await prisma.college.findUnique({ where: { slug: "iit-bombay" } }))!.id,
      userId: user1.id,
      rating: 5.0,
      title: "Best engineering college in India",
      content: "IIT Bombay offers an unparalleled academic experience with world-class faculty and cutting-edge research facilities. The campus life is vibrant with numerous festivals, clubs, and cultural events happening throughout the year. The rigorous curriculum and competitive environment truly prepare you for the challenges of the professional world.",
      pros: "World class faculty, amazing peer group, great placements",
      cons: "Very competitive, high pressure environment",
      batch: 2024,
    },
  })

  await prisma.review.create({
    data: {
      collegeId: (await prisma.college.findUnique({ where: { slug: "iit-bombay" } }))!.id,
      userId: user2.id,
      rating: 4.5,
      title: "Life changing experience",
      content: "My time at IIT Bombay was truly transformative, offering exposure to cutting-edge research from the very first year. The institute provides excellent opportunities to work on funded research projects with renowned professors. The strong alumni network opened doors to amazing career opportunities both in India and abroad.",
      pros: "Excellent research opportunities, great alumni network",
      cons: "Can be stressful during exam season",
      batch: 2023,
    },
  })

  const collegeCount = await prisma.college.count()
  const userCount = await prisma.user.count()

  console.log("✅ Seed completed successfully")
  console.log(`Created colleges: ${collegeCount}`)
  console.log(`Created users: ${userCount}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
