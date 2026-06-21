import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ErrorBoundary from "@/components/shared/ErrorBoundary"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
