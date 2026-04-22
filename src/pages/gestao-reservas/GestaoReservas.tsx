import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

export default function GestaoReservas() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Gestão de Reservas</h1>
        <p className="text-muted-foreground mt-1">Gerencie todas as reservas da clínica.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas Recentes</CardTitle>
          <CardDescription>Módulo em desenvolvimento.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
          <p>Esta funcionalidade estará disponível em breve.</p>
        </CardContent>
      </Card>
    </div>
  )
}
