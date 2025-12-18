import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, ClipboardList, CreditCard } from "lucide-react"

interface StatsCardsProps {
  totalStudents: number
  activeStudents: number
  pendingSubmissions: number
  pendingPayments: number
}

export function StatsCards({
  totalStudents,
  activeStudents,
  pendingSubmissions,
  pendingPayments,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Alumnos",
      value: totalStudents,
      description: `${activeStudents} activos`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Alumnos Activos",
      value: activeStudents,
      description: "Este mes",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Por Calificar",
      value: pendingSubmissions,
      description: "Tareas pendientes",
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Pagos Pendientes",
      value: pendingPayments,
      description: "Por cobrar",
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
