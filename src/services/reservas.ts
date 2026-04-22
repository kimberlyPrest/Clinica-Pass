import pb from '@/lib/pocketbase/client'
import { verificarHorarioBloqueado, verificarHorarioBloqueadoSync } from '@/services/bloqueios'

export const verificarSalasLivres = async (
  dataStr: string,
  horaInicio: string,
  horaFim: string,
) => {
  const salas = await pb.collection('salas').getFullList({ filter: "status='ativa'" })
  const bloqueios = await pb.collection('bloqueios').getFullList()
  const reservas = await pb.collection('reservas').getFullList({ filter: "status='ativa'" })

  const start = new Date(`${dataStr}T${horaInicio}:00`)
  const end = new Date(`${dataStr}T${horaFim}:00`)

  return salas.filter((sala) => {
    const isBlocked = verificarHorarioBloqueadoSync(
      sala.id,
      start,
      horaInicio,
      horaFim,
      bloqueios as any,
    )
    if (isBlocked) return false

    const conflict = reservas.some((r) => {
      if (r.sala_id !== sala.id) return false
      const rStart = new Date(r.data_inicio)
      const rEnd = new Date(r.data_fim)
      return start < rEnd && end > rStart
    })
    if (conflict) return false

    return true
  })
}

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

          const isBlocked = await verificarHorarioBloqueado(
            sala_id,
            date,
            hor.inicio,
            hor.fim,
            bloqueios as any,
          )

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
