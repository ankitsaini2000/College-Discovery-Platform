import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Providers from "@/components/shared/Providers"

const inter = Inter({ subsets: ["latin"] })

const BASE_URL = "https://collegecompass-hub.netlify.app"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a5f",
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CollegeCompass — Find Your Perfect IIT or NIT College",
    template: "%s | CollegeCompass",
  },
  description:
    "Explore 23 IITs and 31 NITs with real JoSAA cutoffs, placements, NIRF rankings, fees, and course data. Compare colleges and predict admission chances with our JEE rank predictor.",
  keywords: [
    "IIT", "NIT", "college predictor", "JEE Main", "JEE Advanced",
    "JoSAA cutoff", "NIRF ranking", "engineering colleges India",
    "college comparison", "IIT admission", "NIT admission",
    "top engineering colleges", "B.Tech admissions",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "CollegeCompass",
    title: "CollegeCompass — Find Your Perfect IIT or NIT College",
    description:
      "Explore 23 IITs and 31 NITs with real JoSAA cutoffs, placements, NIRF rankings, fees, and course data.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CollegeCompass",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeCompass — Find Your Perfect IIT or NIT College",
    description:
      "Explore 23 IITs and 31 NITs with real JoSAA cutoffs, placements, NIRF rankings, fees, and course data.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CollegeCompass",
    url: BASE_URL,
    applicationCategory: "Educational Application",
    operatingSystem: "All",
    description:
      "Discover, compare, and predict college admissions across 23 IITs and 31 NITs in India with real JoSAA cutoff data.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
