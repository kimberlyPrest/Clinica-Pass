import pb from '@/lib/pocketbase/client'

export const getAgendamentosPorMedico = async (medicoId: string) => {
  return pb.collection('agendamentos').getFullList({
    filter: `reserva_id.medico_id = "${medicoId}"`,
    expand: 'reserva_id,reserva_id.sala_id',
    sort: '-hora_inicio',
  })
}

export const getReservasPorMedicoAtivas = async (medicoId: string) => {
  const hoje = new Date().toISOString().split('T')[0]
  return pb.collection('reservas').getFullList({
    filter: `medico_id = "${medicoId}" && status = "ativa" && data_inicio >= "${hoje}"`,
    expand: 'sala_id',
    sort: 'data_inicio',
  })
}

export const getReservas = async () => {
  return pb.collection('reservas').getFullList({
    expand: 'medico_id,sala_id',
    sort: '-data_inicio',
  })
}

export const updateReserva = async (
  id: string,
  data: Partial<{ status: string; data_inicio: string; data_fim: string }>,
) => {
  return pb.collection('reservas').update(id, data)
}

export const createReserva = async (data: any) => {
  return pb.collection('reservas').create(data)
}

export const gerarReservasMensalistas = async () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)
  const startStr = startOfMonth.toISOString().split('T')[0]
  const endStr = endOfMonth.toISOString().split('T')[0]

  const medicos = await pb.collection('medicos').getFullList({
    filter: `tipo = 'mensalista'`,
  })
  if (medicos.length === 0) return

  const salas = await pb.collection('salas').getFullList()
  const defaultSalaId = salas.length > 0 ? salas[0].id : null

  const reservasExistentes = await pb.collection('reservas').getFullList({
    filter: `data_inicio >= "${startStr} 00:00:00" && data_inicio <= "${endStr} 23:59:59"`,
  })

  const bloqueios = await pb.collection('bloqueios').getFullList()

  const checkOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
    return aStart < bEnd && aEnd > bStart
  }

  for (const medico of medicos) {
    if (!medico.horarios_fixos) continue

    let configs = medico.horarios_fixos as any
    if (!Array.isArray(configs)) {
      configs = [configs]
    }

    for (const config of configs) {
      const dias_semana: number[] = config.dias_semana || []
      const horarios: { inicio: string; fim: string }[] = config.horarios || []
      const sala_id = config.sala_id || defaultSalaId

      if (!sala_id || dias_semana.length === 0 || horarios.length === 0) continue

      for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const date = new Date(year, month, day)
        if (!dias_semana.includes(date.getDay())) continue

        for (const hor of horarios) {
          const [hIni, mIni] = hor.inicio.split(':').map(Number)
          const [hFim, mFim] = hor.fim.split(':').map(Number)

          const resStart = new Date(year, month, day, hIni, mIni, 0)
          const resEnd = new Date(year, month, day, hFim, mFim, 0)

          const isDuplicate = reservasExistentes.some((r) => {
            const rStart = new Date(r.data_inicio)
            const rEnd = new Date(r.data_fim)
            return (
              r.medico_id === medico.id &&
              r.sala_id === sala_id &&
              rStart.getTime() === resStart.getTime() &&
              rEnd.getTime() === resEnd.getTime()
            )
          })

          if (isDuplicate) continue

          const realDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          const isBlocked = bloqueios.some((b) => {
            if (b.sala_id !== sala_id) return false
            let isDayApplicable = false
            if (b.tipo === 'pontual' || b.tipo === 'periodo') {
              if (b.data_inicio && b.data_fim) {
                if (realDateStr >= b.data_inicio && realDateStr <= b.data_fim)
                  isDayApplicable = true
              } else if (b.data_inicio === realDateStr) {
                isDayApplicable = true
              }
            } else if (b.tipo === 'diario') {
              isDayApplicable = true
            } else if (b.tipo === 'semanal') {
              if (Array.isArray(b.dias_semana) && b.dias_semana.includes(date.getDay())) {
                isDayApplicable = true
              }
            }

            if (!isDayApplicable) return false

            if (b.hora_inicio && b.hora_fim) {
              const [bhIni, bmIni] = b.hora_inicio.split(':').map(Number)
              const [bhFim, bmFim] = b.hora_fim.split(':').map(Number)
              const bStart = new Date(year, month, day, bhIni, bmIni, 0)
              const bEnd = new Date(year, month, day, bhFim, bmFim, 0)
              return checkOverlap(resStart, resEnd, bStart, bEnd)
            }
            return true
          })

          if (isBlocked) continue

          try {
            await pb.collection('reservas').create({
              medico_id: medico.id,
              sala_id: sala_id,
              data_inicio: resStart.toISOString(),
              data_fim: resEnd.toISOString(),
              status: 'ativa',
            })
            reservasExistentes.push({
              medico_id: medico.id,
              sala_id: sala_id,
              data_inicio: resStart.toISOString(),
              data_fim: resEnd.toISOString(),
            } as any)
          } catch (err) {
            console.error('Error creating reserva', err)
          }
        }
      }
    }
  }
}
