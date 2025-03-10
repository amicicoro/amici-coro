import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { NotFoundContent } from "@/components/common/NotFoundContent"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <NotFoundContent />
      </main>

      <Footer />
    </div>
  )
}

