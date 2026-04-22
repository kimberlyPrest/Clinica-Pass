import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Reservas() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Minhas Reservas</h1>
          <p className="text-muted-foreground">Gerencie seus horários de atendimento.</p>
        </div>
        <Button>Nova Reserva</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            Funcionalidade em desenvolvimento. Visualize e gerencie suas reservas detalhadamente
            aqui.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
