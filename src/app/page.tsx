import { Navbar, Hero, Methodology, Levels, Contact, Footer } from "@/components/landing"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Methodology />
        <Levels />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
