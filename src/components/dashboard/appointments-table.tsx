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
import { cn } from '@/lib/utils'

interface Props {
  data: Appointment[]
  status: 'loading' | 'success' | 'empty' | 'error'
  onRetry: () => void
}

function PatientAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#94f2f0]/30 text-[#006564] flex items-center justify-center font-bold text-xs shrink-0 select-none">
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === 'Confirmado'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        isConfirmed ? 'bg-[#E6F2F2] text-[#05807f]' : 'bg-[#e6e8ea] text-[#3e4948]',
      )}
    >
      {status}
    </span>
  )
}

export function AppointmentsTable({ data, status, onRetry }: Props) {
  if (status === 'error') {
    return (
      <Card className="border-destructive/50 bg-destructive/5 shadow-none rounded-xl">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-pulse" />
          <h3 className="text-lg font-bold font-display mb-2">Erro ao carregar agendamentos</h3>
          <p className="text-[#6e7979] mb-6">
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
          <CalendarX className="h-12 w-12 text-[#6e7979] mb-4 opacity-50" />
          <h3 className="text-lg font-bold font-display mb-2">Nenhum agendamento</h3>
          <p className="text-[#6e7979] max-w-sm">
            Não há agendamentos marcados para o período selecionado.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {status === 'loading'
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e6e8ea] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          : data.map((app, i) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-[#e6e8ea] p-5 space-y-4 animate-fade-in hover:shadow-md transition-shadow"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <PatientAvatar initials={app.patientInitials} />
                    <div>
                      <p className="font-bold text-[#191c1e]">{app.patientName}</p>
                      <p className="text-sm text-[#6e7979]">{app.doctorName}</p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex justify-between items-center bg-[#f2f4f6] p-3 rounded-lg">
                  <div className="text-sm">
                    <p className="font-bold text-[#191c1e]">{app.date}</p>
                    <p className="text-[#6e7979]">{app.time}</p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="font-medium text-[#3e4948]">{app.room}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-[#e6e8ea] bg-white shadow-[0_2px_4px_rgba(5,128,127,0.04)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#eceef0] bg-[#f7f9fb] hover:bg-[#f7f9fb]">
              <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#6e7979] uppercase tracking-widest h-12">
                Paciente
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#6e7979] uppercase tracking-widest h-12">
                Médico
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#6e7979] uppercase tracking-widest h-12">
                Data / Hora
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#6e7979] uppercase tracking-widest h-12">
                Sala
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#6e7979] uppercase tracking-widest h-12">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading'
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-[#eceef0]">
                    <TableCell className="h-16 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="px-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              : data.map((app, i) => (
                  <TableRow
                    key={app.id}
                    className="group transition-colors hover:bg-[#f2f4f6]/50 border-b border-[#eceef0] animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <PatientAvatar initials={app.patientInitials} />
                        <span className="font-semibold text-[#191c1e] group-hover:text-[#05807f] transition-colors">
                          {app.patientName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#3e4948]">{app.doctorName}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#191c1e]">{app.date}</span>
                        <span className="text-xs text-[#6e7979] mt-0.5">{app.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#191c1e] font-medium">
                      {app.room}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
