import { parseISO, isBefore, isAfter, format, isSameDay } from 'date-fns'

export function checkConflict(start: Date, end: Date, reservas: any[], salaId: string) {
  const conflicting = reservas.find((r) => {
    if (r.sala_id !== salaId || r.status !== 'ativa') return false
    const rStart = parseISO(r.data_inicio)
    const rEnd = parseISO(r.data_fim)
    return isBefore(start, rEnd) && isAfter(end, rStart)
  })
  if (conflicting) {
    return {
      error: 'conflict',
      reserva: conflicting,
    }
  }
  return null
}

export function checkBlock(start: Date, end: Date, bloqueios: any[], salaId: string) {
  const blocked = bloqueios.find((b) => {
    if (b.sala_id !== salaId) return false

    const bStartDate = b.data_inicio ? parseISO(b.data_inicio + 'T00:00:00') : null
    const bEndDate = b.data_fim ? parseISO(b.data_fim + 'T23:59:59') : null

    if (bStartDate && bEndDate) {
      if (isBefore(start, bStartDate) || isAfter(start, bEndDate)) return false
    } else if (bStartDate && b.tipo === 'pontual') {
      if (!isSameDay(start, bStartDate)) return false
    }

    if (b.hora_inicio && b.hora_fim) {
      const sTime = format(start, 'HH:mm')
      const eTime = format(end, 'HH:mm')
      if (eTime <= b.hora_inicio || sTime >= b.hora_fim) return false
    }

    if (b.dias_semana && b.dias_semana.length > 0) {
      const dayStr = start.getDay().toString()
      if (!b.dias_semana.includes(dayStr) && !b.dias_semana.includes(Number(dayStr))) return false
    }

    return true
  })

  if (blocked) {
    return { error: 'blocked', block: blocked }
  }
  return null
}
