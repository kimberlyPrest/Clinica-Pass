import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, differenceInMinutes } from 'date-fns'

export function ReservaDetalhesModal({
  reserva,
  agendamentos,
  open,
  onOpenChange,
  onEdit,
  onCancel,
}: any) {
  if (!reserva) return null
  const relatedAgs = agendamentos.filter((a: any) => a.reserva_id === reserva.id)
  const duracao = differenceInMinutes(new Date(reserva.data_fim), new Date(reserva.data_inicio))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 mt-2 bg-muted/40 p-4 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Médico</p>
            <p className="font-medium">{reserva.expand?.medico_id?.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sala</p>
            <p className="font-medium">{reserva.expand?.sala_id?.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data/Hora</p>
            <p className="font-medium">
              {format(new Date(reserva.data_inicio), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duração</p>
            <p className="font-medium">{duracao} min</p>
          </div>
        </div>
        <h3 className="font-semibold mb-2">Pacientes Agendados ({relatedAgs.length})</h3>
        <div className="border rounded-md max-h-64 overflow-y-auto mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Horário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedAgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Nenhum paciente agendado.
                  </TableCell>
                </TableRow>
              ) : (
                relatedAgs.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.paciente_nome}</TableCell>
                    <TableCell>{a.paciente_telefone}</TableCell>
                    <TableCell>
                      {format(new Date(a.hora_inicio), 'HH:mm')} -{' '}
                      {format(new Date(a.hora_fim), 'HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {reserva.status === 'ativa' && (
            <>
              <Button variant="outline" onClick={() => onEdit(reserva)}>
                Editar Reserva
              </Button>
              <Button variant="destructive" onClick={() => onCancel(reserva)}>
                Cancelar Reserva
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
