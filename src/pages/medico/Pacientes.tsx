import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Pacientes() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Meus Pacientes</h1>
          <p className="text-muted-foreground">Lista de pacientes atendidos e agendados.</p>
        </div>
        <Button>Registrar Novo Paciente</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diretório de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            A lista completa de seus pacientes será exibida aqui.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
