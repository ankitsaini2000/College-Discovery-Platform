import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import FloatingCompareBar from "@/components/compare/FloatingCompareBar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      <FloatingCompareBar />
    </div>
  )
}
