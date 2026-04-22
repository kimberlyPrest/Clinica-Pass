import pb from '@/lib/pocketbase/client'

export interface Bloqueio {
  id: string
  sala_id: string
  tipo: 'pontual' | 'diario' | 'semanal' | 'mensal' | 'periodo' | 'recorrencia_complexa'
  data_inicio?: string
  data_fim?: string
  hora_inicio?: string
  hora_fim?: string
  dias_semana?: string[] | number[]
  created: string
  updated: string
}

export const getBloqueios = () => pb.collection('bloqueios').getFullList<Bloqueio>()
export const createBloqueio = (data: Partial<Bloqueio>) =>
  pb.collection('bloqueios').create<Bloqueio>(data)
export const updateBloqueio = (id: string, data: Partial<Bloqueio>) =>
  pb.collection('bloqueios').update<Bloqueio>(id, data)
export const deleteBloqueio = (id: string) => pb.collection('bloqueios').delete(id)

export function avaliarRecorrenciaComplexa(padrao: string, data: Date): boolean {
  const year = data.getFullYear()
  const month = data.getMonth()
  const dateObjDay = data.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dateObjDate = data.getDate() // 1 to 31

  const p = padrao.toLowerCase().trim()

  const diasSemanaMap: Record<string, number> = {
    domingo: 0,
    segunda: 1,
    'segunda-feira': 1,
    terça: 2,
    terca: 2,
    'terça-feira': 2,
    quarta: 3,
    'quarta-feira': 3,
    quinta: 4,
    'quinta-feira': 4,
    sexta: 5,
    'sexta-feira': 5,
    sábado: 6,
    sabado: 6,
  }

  // "1º domingo de cada mês", "2a terça-feira de cada mes"
  const nthDayMatch = p.match(/^(\d)[ºoa\.]?\s+(.+?)\s+de\s+cada\s+m[eê]s$/)
  if (nthDayMatch) {
    const n = parseInt(nthDayMatch[1], 10)
    const diaStr = nthDayMatch[2]
    const targetDay = diasSemanaMap[diaStr]
    
    if (targetDay !== undefined) {
      const isTargetDay = dateObjDay === targetDay
      const isNthWeek = dateObjDate >= (n - 1) * 7 + 1 && dateObjDate <= n * 7
      return isTargetDay && isNthWeek
    }
  }

  // "último domingo de cada mês"
  const lastDayMatch = p.match(/^(?:[úu]ltimo|[úu]ltima)\s+(.+?)\s+de\s+cada\s+m[eê]s$/)
  if (lastDayMatch) {
    const diaStr = lastDayMatch[1]
    
    if (diaStr === 'dia') {
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
      return dateObjDate === lastDayOfMonth
    }

    const targetDay = diasSemanaMap[diaStr]
    if (targetDay !== undefined) {
      const lastDayOfMonth = new Date(year, month + 1, 0)
      let lastDate = lastDayOfMonth.getDate()
      while (new Date(year, month, lastDate).getDay() !== targetDay) {
        lastDate--
      }
      return dateObjDay === targetDay && dateObjDate === lastDate
    }
  }

  // "penúltimo dia de cada mês"
  const penultimoDayMatch = p.match(/^pen[úu]ltimo\s+dia\s+de\s+cada\s+m[eê]s$/)
  if (penultimoDayMatch) {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
    return dateObjDate === lastDayOfMonth - 1
  }

  return false
}

export function verificarHorarioBloqueadoSync(
  sala_id: string,
  data: Date,
  horaInicio: string,
  horaFim: string,
  bloqueios: Bloqueio[],
): boolean {
  const year = data.getFullYear()
  const month = data.getMonth()
  const day = data.getDate()
  const realDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const [hIni, mIni] = horaInicio.split(':').map(Number)
  const [hFim, mFim] = horaFim.split(':').map(Number)
  const resStart = new Date(year, month, day, hIni, mIni, 0)
  const resEnd = new Date(year, month, day, hFim, mFim, 0)

  const checkOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
    return aStart < bEnd && aEnd > bStart
  }

  const diaDaSemanaMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

  for (const b of bloqueios) {
    if (b.sala_id !== sala_id) continue

    let isDayApplicable = false

    if (b.tipo === 'pontual' || b.tipo === 'periodo') {
      if (b.data_inicio && b.data_fim) {
        if (realDateStr >= b.data_inicio && realDateStr <= b.data_fim) isDayApplicable = true
      } else if (b.data_inicio === realDateStr) {
        isDayApplicable = true
      }
    } else if (b.tipo === 'diario') {
      isDayApplicable = true
    } else if (b.tipo === 'semanal') {
      if (Array.isArray(b.dias_semana)) {
        if (
          b.dias_semana.includes(diaDaSemanaMap[data.getDay()]) ||
          b.dias_semana.includes(String(data.getDay())) ||
          b.dias_semana.includes(data.getDay() as any)
        ) {
          isDayApplicable = true
        }
      }
    } else if (b.tipo === 'mensal') {
      if (b.data_inicio) {
        const bDay = parseInt(b.data_inicio.split('-')[2] || b.data_inicio, 10)
        if (!isNaN(bDay) && bDay === day) isDayApplicable = true
      }
    } else if (b.tipo === 'recorrencia_complexa') {
      if (b.data_inicio && avaliarRecorrenciaComplexa(b.data_inicio, data)) {
        isDayApplicable = true
      }
    }

    if (!isDayApplicable) continue

    if (b.hora_inicio && b.hora_fim) {
      const [bhIni, bmIni] = b.hora_inicio.split(':').map(Number)
      const [bhFim, bmFim] = b.hora_fim.split(':').map(Number)
      const bStart = new Date(year, month, day, bhIni, bmIni, 0)
      const bEnd = new Date(year, month, day, bhFim, bmFim, 0)
      if (checkOverlap(resStart, resEnd, bStart, bEnd)) return true
    } else {
      return true
    }
  }

  return false
}

export async function verificarHorarioBloqueado(
  sala_id: string,
  data: Date,
  horaInicio: string,
  horaFim: string,
  bloqueiosCached?: Bloqueio[],
): Promise<boolean> {
  const bloqueios = bloqueiosCached || (await getBloqueios())
  return verificarHorarioBloqueadoSync(sala_id, data, horaInicio, horaFim, bloqueios as any)
}

export function isDateFullyBlocked(sala_id: string, data: Date, bloqueios: Bloqueio[]): boolean {
  const year = data.getFullYear()
  const month = data.getMonth()
  const day = data.getDate()
  const realDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const diaDaSemanaMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

  for (const b of bloqueios) {
    if (b.sala_id !== sala_id) continue

    let isDayApplicable = false
    if (b.tipo === 'pontual' || b.tipo === 'periodo') {
      if (b.data_inicio && b.data_fim) {
        if (realDateStr >= b.data_inicio && realDateStr <= b.data_fim) isDayApplicable = true
      } else if (b.data_inicio === realDateStr) {
        isDayApplicable = true
      }
    } else if (b.tipo === 'diario') {
      isDayApplicable = true
    } else if (b.tipo === 'semanal') {
      if (Array.isArray(b.dias_semana)) {
        if (
          b.dias_semana.includes(diaDaSemanaMap[data.getDay()]) ||
          b.dias_semana.includes(String(data.getDay())) ||
          b.dias_semana.includes(data.getDay() as any)
        ) {
          isDayApplicable = true
        }
      }
    } else if (b.tipo === 'mensal') {
      if (b.data_inicio) {
        const bDay = parseInt(b.data_inicio.split('-')[2] || b.data_inicio, 10)
        if (!isNaN(bDay) && bDay === day) isDayApplicable = true
      }
    } else if (b.tipo === 'recorrencia_complexa') {
      if (b.data_inicio && avaliarRecorrenciaComplexa(b.data_inicio, data)) {
        isDayApplicable = true
      }
    }

    if (
      isDayApplicable &&
      (!b.hora_inicio || !b.hora_fim || (b.hora_inicio === '00:00' && b.hora_fim === '23:59'))
    ) {
      return true
    }
  }
  return false
}
