import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, Clock } from 'lucide-react'

export default function DashboardMedico() {
  const { user } = useAuth()

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary mb-2">
          Bem-vindo, {user?.name || 'Doutor'}
        </h1>
        <p className="text-muted-foreground">Acompanhe sua agenda e próximos pacientes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Nenhum paciente agendado</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horas Trabalhadas
            </CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximo Horário
            </CardTitle>
            <CalendarDays className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Livre</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
