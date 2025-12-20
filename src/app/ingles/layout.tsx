import { EnglishSidebar } from "@/components/ingles/sidebar"
import { getCurrentUser } from "@/lib/auth"

export default async function InglesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <EnglishSidebar user={user} />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
