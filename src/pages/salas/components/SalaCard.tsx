import { Sala } from '@/services/salas'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Lock, Pencil, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  sala: Sala
  ocupacao: number
  onEdit: () => void
  onBlock: () => void
  onOpenAgenda: () => void
}

export function SalaCard({ sala, ocupacao, onEdit, onBlock, onOpenAgenda }: Props) {
  const isAtiva = sala.status === 'ativa'

  return (
    <Card className="group transition-all hover:shadow-elevation hover:-translate-y-1 bg-white border-border/50">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <h3 className="font-bold text-lg text-primary truncate max-w-[200px]" title={sala.nome}>
            {sala.nome}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {sala.horario_inicio} - {sala.horario_fim}
          </p>
        </div>
        <Badge
          variant={isAtiva ? 'default' : 'secondary'}
          className={cn(isAtiva ? 'bg-emerald-500 hover:bg-emerald-600' : '')}
        >
          {isAtiva ? 'Ativa' : 'Inativa'}
        </Badge>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={onOpenAgenda}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Próximo uso</span>
            </div>
            <span className="text-sm text-primary font-bold">Hoje, 14:30</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Ocupação do mês</span>
              <span className="font-bold text-primary">{ocupacao}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  ocupacao > 80
                    ? 'bg-destructive'
                    : ocupacao > 50
                      ? 'bg-primary'
                      : 'bg-emerald-500',
                )}
                style={{ width: `${ocupacao}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={onEdit}>
          <Pencil className="w-3 h-3 mr-2" /> Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
          onClick={onBlock}
        >
          <Lock className="w-3 h-3 mr-2" /> Bloquear
        </Button>
      </CardFooter>
    </Card>
  )
}
