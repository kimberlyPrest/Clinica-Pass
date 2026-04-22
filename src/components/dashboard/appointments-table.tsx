import { Appointment } from './types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CalendarX, Edit2, Trash2 } from 'lucide-react'

interface Props {
  data: Appointment[]
  status: 'loading' | 'success' | 'empty' | 'error'
  onRetry: () => void
}

export function AppointmentsTable({ data, status, onRetry }: Props) {
  if (status === 'error') {
    return (
      <Card className="border-destructive/50 bg-destructive/5 shadow-none">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-pulse" />
          <h3 className="text-lg font-display font-semibold mb-2">Erro ao carregar agendamentos</h3>
          <p className="text-muted-foreground mb-6">
            Ocorreu um problema de conexão ao buscar os dados mais recentes.
          </p>
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'empty' || (status === 'success' && data.length === 0)) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
          <CalendarX className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold mb-2">Nenhum agendamento</h3>
          <p className="text-muted-foreground max-w-sm">
            Não há agendamentos marcados para os filtros selecionados no período escolhido.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {status === 'loading'
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full mt-2" />
                </CardContent>
              </Card>
            ))
          : data.map((app, i) => (
              <Card
                key={app.id}
                className="transition-all shadow-sm hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{app.patientName}</p>
                      <p className="text-sm text-muted-foreground">{app.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{app.time}</p>
                      <p className="text-sm font-medium">{app.room}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center">
                    <p className="text-sm font-medium text-muted-foreground">{app.doctorName}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-primary hover:bg-primary/10"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-destructive hover:bg-destructive/10 border-destructive/20"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-display font-semibold">Paciente</TableHead>
              <TableHead className="font-display font-semibold">Telefone</TableHead>
              <TableHead className="font-display font-semibold">Hora do Atendimento</TableHead>
              <TableHead className="font-display font-semibold">Médico</TableHead>
              <TableHead className="font-display font-semibold">Sala</TableHead>
              <TableHead className="text-right font-display font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading'
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : data.map((app, i) => (
                  <TableRow
                    key={app.id}
                    className="group transition-colors hover:bg-muted/50 animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <TableCell className="font-medium">{app.patientName}</TableCell>
                    <TableCell className="text-muted-foreground">{app.phone}</TableCell>
                    <TableCell className="font-bold text-primary">{app.time}</TableCell>
                    <TableCell>{app.doctorName}</TableCell>
                    <TableCell>{app.room}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
