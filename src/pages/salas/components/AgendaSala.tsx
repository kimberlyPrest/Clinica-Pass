import { useState, useEffect, useCallback } from 'react'
import { Sala } from '@/services/salas'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  isWithinInterval,
  addDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import type { Medico } from '@/services/medicos'
import { getMedicos } from '@/services/medicos'
import { getSalas } from '@/services/salas'
import BookingModal from '@/pages/agenda/BookingModal'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sala: Sala
}

interface ReservaBlock {
  medicoNome: string
  data_inicio: string
  data_fim: string
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8h – 20h
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function AgendaSala({ open, onOpenChange, sala }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [reservas, setReservas] = useState<ReservaBlock[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(false)

  // Booking modal state
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)

  // Current week reference date
  const baseDate = addWeeks(startOfWeek(new Date(), { locale: ptBR }), weekOffset)
  const weekStart = startOfWeek(baseDate, { locale: ptBR })
  const weekEnd = endOfWeek(baseDate, { locale: ptBR })

  // Generate the 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const fetchReservas = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const items = await pb.collection('reservas').getFullList({
        filter: `sala_id = "${sala.id}" && data_inicio >= "${weekStart.toISOString()}" && data_fim <= "${weekEnd.toISOString()}" && status = "ativa"`,
        expand: 'medico_id',
        sort: 'data_inicio',
      })
      setReservas(
        items.map((r: any) => ({
          medicoNome: r.expand?.medico_id?.nome ?? 'Médico',
          data_inicio: r.data_inicio,
          data_fim: r.data_fim,
        })),
      )
    } catch (e) {
      console.error('AgendaSala fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [open, sala.id, weekOffset])

  // Load medicos & salas for BookingModal (only once per open)
  useEffect(() => {
    if (!open) return
    Promise.all([getMedicos(), getSalas()]).then(([meds, sls]) => {
      setMedicos(meds)
      setSalas(sls)
    })
  }, [open])

  useEffect(() => {
    fetchReservas()
  }, [fetchReservas])

  // Check if a cell (dayIndex, hour) overlaps with any real reservation
  function getBlockForCell(dayDate: Date, hour: number): ReservaBlock | null {
    const cellStart = new Date(dayDate)
    cellStart.setHours(hour, 0, 0, 0)
    const cellEnd = new Date(dayDate)
    cellEnd.setHours(hour + 1, 0, 0, 0)

    return (
      reservas.find((r) => {
        const rStart = parseISO(r.data_inicio)
        const rEnd = parseISO(r.data_fim)
        // Cell overlaps with reservation if starts before rEnd and ends after rStart
        return cellStart < rEnd && cellEnd > rStart
      }) ?? null
    )
  }

  // Top of a reservation block — the first hour that starts it (used to render the label)
  function isBlockStart(dayDate: Date, hour: number, block: ReservaBlock): boolean {
    const rStart = parseISO(block.data_inicio)
    const cellStart = new Date(dayDate)
    cellStart.setHours(hour, 0, 0, 0)
    const prevCell = new Date(dayDate)
    prevCell.setHours(hour - 1, 0, 0, 0)
    return rStart >= cellStart || rStart >= prevCell
  }

  const headerLabel = `${format(weekStart, "dd 'de' MMM", { locale: ptBR })} – ${format(weekEnd, "dd 'de' MMM yyyy", { locale: ptBR })}`

  const handleCellClick = (dayDate: Date, hour: number, block: ReservaBlock | null) => {
    if (block) return // occupied — do nothing
    setSelectedSlot({
      date: format(dayDate, 'yyyy-MM-dd'),
      hour,
    })
    setBookingOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 py-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Agenda:{' '}
                <span className="text-primary">{sala.nome}</span>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                  Hoje
                </Button>
                <div className="flex items-center border rounded-md overflow-hidden bg-white">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => setWeekOffset((o) => o - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 text-sm font-medium text-muted-foreground min-w-[180px] text-center">
                    {headerLabel}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => setWeekOffset((o) => o + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col bg-card">
            {/* Day header row */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-3 text-center border-r bg-muted/20 text-xs font-medium text-muted-foreground uppercase">
                Horário
              </div>
              {weekDays.map((d, i) => {
                const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                return (
                  <div
                    key={i}
                    className={cn(
                      'p-3 text-center border-r text-sm font-semibold',
                      isToday
                        ? 'bg-primary/5 text-primary border-b-2 border-b-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div className="text-xs font-normal opacity-70">{format(d, 'dd/MM')}</div>
                  </div>
                )
              })}
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
                    {weekDays.map((dayDate, dayIdx) => {
                      const block = getBlockForCell(dayDate, h)
                      const occupied = !!block
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            'border-r transition-colors relative group',
                            occupied
                              ? 'bg-primary/10 cursor-default'
                              : 'hover:bg-secondary/20 cursor-pointer',
                          )}
                          onClick={() => handleCellClick(dayDate, h, block)}
                        >
                          {/* "+ Agendar" hint for free slots */}
                          {!occupied && (
                            <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                              <span className="text-[10px] bg-primary text-white px-2 py-1 rounded shadow-sm opacity-80">
                                + Agendar
                              </span>
                            </div>
                          )}

                          {/* Render reservation label at the first occupied cell */}
                          {occupied && block && (() => {
                            const rStart = parseISO(block.data_inicio)
                            const cellHourStart = new Date(dayDate)
                            cellHourStart.setHours(h, 0, 0, 0)
                            const prevHourStart = new Date(dayDate)
                            prevHourStart.setHours(h - 1, 59, 59, 999)
                            const isFirst = rStart > prevHourStart
                            if (!isFirst) return null
                            return (
                              <div className="absolute inset-1 bg-primary/20 text-primary border border-primary/30 rounded p-1 text-[10px] font-semibold overflow-hidden shadow-sm pointer-events-none">
                                <div className="truncate">{block.medicoNome}</div>
                                <div className="opacity-70">
                                  {format(parseISO(block.data_inicio), 'HH:mm')}–{format(parseISO(block.data_fim), 'HH:mm')}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking modal pre-filled with sala & slot */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        medicos={medicos}
        salas={salas}
        onSaved={() => {
          fetchReservas()
        }}
        initialDate={selectedSlot?.date}
        initialTime={selectedSlot ? `${selectedSlot.hour.toString().padStart(2, '0')}:00` : undefined}
        initialSalaId={sala.id}
      />
    </>
  )
}
