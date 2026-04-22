import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { User, Phone, Clock, Calendar, Edit2, XCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { AgendamentoEditForm } from './AgendamentoEditForm'
import { AgendamentoRescheduleForm } from './AgendamentoRescheduleForm'
import { AgendamentoCancelForm } from './AgendamentoCancelForm'

type Mode = 'view' | 'edit' | 'reschedule' | 'cancel'

interface Props {
  agendamento: any
  open: boolean
  onOpenChange: (o: boolean) => void
  onRefresh: () => void
}

export function AgendamentoDetailsModal({ agendamento, open, onOpenChange, onRefresh }: Props) {
  const [mode, setMode] = useState<Mode>('view')
  const [isDirty, setIsDirty] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMode('view')
      setIsDirty(false)
    }
  }, [open, agendamento])

  if (!agendamento) return null

  const handleOpenChange = (val: boolean) => {
    if (!val && isDirty) {
      if (!confirm('Você tem alterações não salvas. Deseja realmente sair?')) return
    }
    onOpenChange(val)
  }

  const handleSuccess = () => {
    setIsDirty(false)
    setMode('view')
    onRefresh()
    if (mode === 'cancel') onOpenChange(false)
  }

  const renderView = () => {
    const start = parseISO(agendamento.hora_inicio)
    const end = parseISO(agendamento.hora_fim)
    return (
      <div className="space-y-4 py-4">
        <div className="bg-muted/20 p-4 rounded-xl border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#05807f]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#05807f]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Paciente
              </div>
              <div className="font-bold text-lg">{agendamento.paciente_nome}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium pl-13">
            <Phone className="w-4 h-4" />
            <span>{agendamento.paciente_telefone || 'Telefone não informado'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-lg border">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-[11px] text-muted-foreground font-semibold uppercase">Data</div>
              <div className="font-medium text-sm">{format(start, 'dd/MM/yyyy')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-lg border">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-[11px] text-muted-foreground font-semibold uppercase">
                Horário
              </div>
              <div className="font-medium text-sm">
                {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between border-t pt-4">
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => setMode('cancel')}
          >
            <XCircle className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1" onClick={() => setMode('reschedule')}>
              <RefreshCw className="w-4 h-4 mr-2" /> Remarcar
            </Button>
            <Button variant="outline" className="flex-none px-3" onClick={() => setMode('edit')}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const titles = {
    view: 'Detalhes da Consulta',
    edit: 'Editar Agendamento',
    reschedule: 'Remarcar Agendamento',
    cancel: 'Cancelar Agendamento',
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] w-[90vw] animate-in fade-in-0 duration-200"
        onInteractOutside={(e) => {
          if (isDirty && !confirm('Você tem alterações não salvas. Deseja sair?'))
            e.preventDefault()
        }}
      >
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0">
          {mode !== 'view' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                if (!isDirty || confirm('Descartar alterações?')) {
                  setMode('view')
                  setIsDirty(false)
                }
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <DialogTitle className="text-xl text-[#05807f]">{titles[mode]}</DialogTitle>
            <DialogDescription className="mt-1">
              {mode === 'view'
                ? 'Gerencie o agendamento do paciente.'
                : 'Atualize as informações conforme necessário.'}
            </DialogDescription>
          </div>
        </DialogHeader>
        {mode === 'view' && renderView()}
        {mode === 'edit' && (
          <AgendamentoEditForm
            agendamento={agendamento}
            onSuccess={handleSuccess}
            onCancel={() => {
              setMode('view')
              setIsDirty(false)
            }}
            setIsDirty={setIsDirty}
          />
        )}
        {mode === 'reschedule' && (
          <AgendamentoRescheduleForm
            agendamento={agendamento}
            onSuccess={handleSuccess}
            onCancel={() => {
              setMode('view')
              setIsDirty(false)
            }}
            setIsDirty={setIsDirty}
          />
        )}
        {mode === 'cancel' && (
          <AgendamentoCancelForm
            agendamento={agendamento}
            onSuccess={handleSuccess}
            onCancel={() => setMode('view')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
