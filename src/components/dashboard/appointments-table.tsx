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
import { AlertCircle, CalendarX } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  data: Appointment[]
  status: 'loading' | 'success' | 'empty' | 'error'
  onRetry: () => void
}

export function AppointmentsTable({ data, status, onRetry }: Props) {
  if (status === 'error') {
    return (
      <Card className="border-destructive/50 bg-destructive/5 shadow-none rounded-xl">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-pulse" />
          <h3 className="text-lg font-display font-bold mb-2">Erro ao carregar agendamentos</h3>
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
      <Card className="border-dashed shadow-none rounded-xl">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
          <CalendarX className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-display font-bold mb-2">Nenhum agendamento</h3>
          <p className="text-muted-foreground max-w-sm">
            Não há agendamentos marcados para o período selecionado.
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
              <Card key={i} className="rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-full mt-2" />
                </CardContent>
              </Card>
            ))
          : data.map((app, i) => (
              <Card
                key={app.id}
                className="transition-all shadow-sm hover:shadow-md animate-fade-in rounded-xl border-border/50"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border bg-accent/10 text-accent font-bold">
                        <AvatarFallback className="bg-transparent">
                          {app.patientInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground">{app.patientName}</p>
                        <p className="text-sm text-muted-foreground">{app.doctorName}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-bold border-0',
                        app.status === 'Confirmado'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {app.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg">
                    <div className="text-sm">
                      <p className="font-bold text-foreground">{app.date}</p>
                      <p className="text-muted-foreground">{app.time}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-bold text-foreground">Sala</p>
                      <p className="text-muted-foreground">{app.room}</p>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" className="flex-1 font-bold">
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive hover:bg-destructive/10 border-destructive/20 font-bold"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-secondary/10 hover:bg-secondary/10">
              <TableHead className="font-display font-bold text-muted-foreground text-xs uppercase tracking-wider h-12">
                Paciente
              </TableHead>
              <TableHead className="font-display font-bold text-muted-foreground text-xs uppercase tracking-wider h-12">
                Médico
              </TableHead>
              <TableHead className="font-display font-bold text-muted-foreground text-xs uppercase tracking-wider h-12">
                Data / Hora
              </TableHead>
              <TableHead className="font-display font-bold text-muted-foreground text-xs uppercase tracking-wider h-12">
                Sala
              </TableHead>
              <TableHead className="font-display font-bold text-muted-foreground text-xs uppercase tracking-wider h-12">
                Status
              </TableHead>
              <TableHead className="text-right font-display font-bold text-muted-foreground text-xs uppercase tracking-wider h-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading'
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/50">
                    <TableCell className="h-16">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : data.map((app, i) => (
                  <TableRow
                    key={app.id}
                    className="group transition-colors hover:bg-secondary/20 border-b border-border/50 animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-accent/10 text-accent font-bold text-xs">
                          <AvatarFallback className="bg-transparent">
                            {app.patientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-foreground">{app.patientName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {app.doctorName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{app.date}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{app.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground font-medium">{app.room}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-bold border-0 px-3',
                          app.status === 'Confirmado'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 font-bold hover:bg-accent/10 hover:text-accent"
                        >
                          Editar
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
