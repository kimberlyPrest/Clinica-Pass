import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { ArrowUpDown, CalendarX, Eye, Edit, Trash2 } from 'lucide-react'
import { ReservaDetalhesModal } from './ReservaDetalhesModal'
import { ReservaEditarModal } from './ReservaEditarModal'
import { ReservaCancelarModal } from './ReservaCancelarModal'

export function ReservaList({ loading, error, onRetry, reservas, agendamentos }: any) {
  const isMobile = useIsMobile()
  const [sortCol, setSortCol] = useState('data')
  const [sortDesc, setSortDesc] = useState(true)
  const [page, setPage] = useState(1)

  const [selectedReserva, setSelectedReserva] = useState<any>(null)
  const [modalType, setModalType] = useState<'detalhes' | 'editar' | 'cancelar' | null>(null)

  if (loading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  if (error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Erro ao carregar dados.</p>
        <Button onClick={onRetry}>Tentar novamente</Button>
      </div>
    )
  if (reservas.length === 0)
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarX className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>Nenhuma reserva encontrada.</p>
      </div>
    )

  const sorted = [...reservas].sort((a, b) => {
    let cmp = 0
    if (sortCol === 'data')
      cmp = new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
    if (sortCol === 'medico')
      cmp = (a.expand?.medico_id?.nome || '').localeCompare(b.expand?.medico_id?.nome || '')
    if (sortCol === 'sala')
      cmp = (a.expand?.sala_id?.nome || '').localeCompare(b.expand?.sala_id?.nome || '')
    return sortDesc ? -cmp : cmp
  })

  const paginated = sorted.slice((page - 1) * 15, page * 15)

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDesc(!sortDesc)
    else {
      setSortCol(col)
      setSortDesc(false)
    }
  }

  const openModal = (r: any, type: any) => {
    setSelectedReserva(r)
    setModalType(type)
  }

  return (
    <>
      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {paginated.map((r) => {
            const ags = agendamentos.filter((a: any) => a.reserva_id === r.id).length
            const isAtiva = r.status === 'ativa'
            return (
              <Card
                key={r.id}
                className={
                  isAtiva
                    ? 'border-l-4 border-l-[#05807f]'
                    : 'border-l-4 border-l-gray-400 opacity-70'
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{r.expand?.medico_id?.nome}</CardTitle>
                    <Badge
                      variant={isAtiva ? 'default' : 'secondary'}
                      className={isAtiva ? 'bg-[#05807f]' : ''}
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.expand?.sala_id?.nome}</p>
                </CardHeader>
                <CardContent className="text-sm space-y-1 pb-4">
                  <p>
                    <strong>Data:</strong> {format(new Date(r.data_inicio), 'dd/MM/yyyy HH:mm')}
                  </p>
                  <p>
                    <strong>Pacientes:</strong> {ags}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openModal(r, 'detalhes')}
                  >
                    <Eye className="w-4 h-4 mr-2" /> Detalhes
                  </Button>
                  {isAtiva && (
                    <Button variant="outline" size="sm" onClick={() => openModal(r, 'editar')}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {isAtiva && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openModal(r, 'cancelar')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('data')}>
                  Data/Hora <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('medico')}>
                  Médico <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('sala')}>
                  Sala <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Pacientes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((r) => {
                const ags = agendamentos.filter((a: any) => a.reserva_id === r.id).length
                const duracao =
                  (new Date(r.data_fim).getTime() - new Date(r.data_inicio).getTime()) / 60000
                const isAtiva = r.status === 'ativa'
                return (
                  <TableRow key={r.id} className={!isAtiva ? 'opacity-70 bg-gray-50/50' : ''}>
                    <TableCell>{format(new Date(r.data_inicio), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{r.expand?.medico_id?.nome}</TableCell>
                    <TableCell>{r.expand?.sala_id?.nome}</TableCell>
                    <TableCell>{duracao} min</TableCell>
                    <TableCell>{ags}</TableCell>
                    <TableCell>
                      <Badge
                        variant={isAtiva ? 'default' : 'secondary'}
                        className={isAtiva ? 'bg-[#05807f]' : ''}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(r, 'detalhes')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAtiva && (
                        <Button variant="ghost" size="icon" onClick={() => openModal(r, 'editar')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {isAtiva && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => openModal(r, 'cancelar')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {sorted.length > 15 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 15 + 1} a {Math.min(page * 15, sorted.length)} de{' '}
            {sorted.length}
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(Math.ceil(sorted.length / 15), p + 1))}
              disabled={page >= Math.ceil(sorted.length / 15)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <ReservaDetalhesModal
        reserva={selectedReserva}
        agendamentos={agendamentos}
        open={modalType === 'detalhes'}
        onOpenChange={(o: boolean) => !o && setModalType(null)}
        onEdit={(r: any) => openModal(r, 'editar')}
        onCancel={(r: any) => openModal(r, 'cancelar')}
      />
      <ReservaEditarModal
        reserva={selectedReserva}
        agendamentos={agendamentos}
        open={modalType === 'editar'}
        onOpenChange={(o: boolean) => !o && setModalType(null)}
        onSuccess={() => setModalType(null)}
      />
      <ReservaCancelarModal
        reserva={selectedReserva}
        open={modalType === 'cancelar'}
        onOpenChange={(o: boolean) => !o && setModalType(null)}
        onSuccess={() => setModalType(null)}
      />
    </>
  )
}
