import { StudentSidebar } from "@/components/estudiante/sidebar"
import { getCurrentUser } from "@/lib/auth"

export default async function EstudianteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar user={user} />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
