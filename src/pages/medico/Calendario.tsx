import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Calendario() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary">Meu Calendário</h1>
        <p className="text-muted-foreground">Visão geral de seus agendamentos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            O calendário interativo será exibido aqui.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
