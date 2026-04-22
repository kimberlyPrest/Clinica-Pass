import { Sala } from '@/services/salas'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sala: Sala
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8h - 20h
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Mock blocks for demo purposes as specified in AC
const MOCK_BLOCKS = [
  { day: 1, start: 12, end: 13, title: 'Almoço (Bloqueio)' },
  { day: 1, start: 14, end: 15.5, title: 'Consulta - João S.' },
  { day: 3, start: 9, end: 11, title: 'Manutenção' },
  { day: 4, start: 15, end: 16, title: 'Consulta - Maria O.' },
]

export function AgendaSala({ open, onOpenChange, sala }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Agenda: <span className="text-primary">{sala.nome}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Hoje
              </Button>
              <div className="flex items-center border rounded-md overflow-hidden bg-white">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 text-sm font-medium text-muted-foreground">Esta Semana</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col bg-card">
          {/* Header row */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 text-center border-r bg-muted/20 text-xs font-medium text-muted-foreground uppercase">
              Horário
            </div>
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  'p-3 text-center border-r text-sm font-semibold',
                  i === 1
                    ? 'bg-primary/5 text-primary border-b-2 border-b-primary'
                    : 'text-muted-foreground',
                )}
              >
                {d}
              </div>
            ))}
          </div>

          <ScrollArea className="flex-1">
            <div className="relative" style={{ height: HOURS.length * 60 }}>
              {/* Grid Background */}
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="grid grid-cols-8 border-b absolute w-full"
                  style={{ top: i * 60, height: 60 }}
                >
                  <div className="border-r p-2 text-right text-xs text-muted-foreground font-medium bg-muted/10">
                    {h.toString().padStart(2, '0')}:00
                  </div>
                  {DAYS.map((_, dayIdx) => (
                    <div
                      key={dayIdx}
                      className="border-r hover:bg-secondary/20 cursor-pointer transition-colors relative group"
                      onClick={() =>
                        alert(
                          `Preparando agendamento para ${DAYS[dayIdx]} às ${h}h na sala ${sala.nome}`,
                        )
                      }
                    >
                      <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                        <span className="text-[10px] bg-primary text-white px-2 py-1 rounded shadow-sm opacity-80">
                          + Agendar
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Render Blocks */}
              {MOCK_BLOCKS.map((block, idx) => {
                const top = (block.start - 8) * 60
                const height = (block.end - block.start) * 60
                const left = `${(block.day + 1) * (100 / 8)}%`
                const width = `${100 / 8}%`

                const isBlock =
                  block.title.includes('Bloqueio') || block.title.includes('Manutenção')

                return (
                  <div
                    key={idx}
                    className={cn(
                      'absolute rounded-md m-1 p-2 text-xs font-medium border overflow-hidden transition-all hover:scale-[1.02] cursor-pointer shadow-sm',
                      isBlock
                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                        : 'bg-primary/20 text-primary border-primary/30',
                    )}
                    style={{ top, height: height - 8, left, width: `calc(${width} - 8px)` }}
                  >
                    <div className="font-bold truncate">{block.title}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {Math.floor(block.start)}:{(block.start % 1) * 60 || '00'} -
                      {Math.floor(block.end)}:{(block.end % 1) * 60 || '00'}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
