cronAdd('gerar_reservas_mensalistas', '1 0 1 * *', () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)

  const medicos = $app.findRecordsByFilter('medicos', "tipo = 'mensalista'", '', 0, 0)
  if (!medicos || medicos.length === 0) return

  let defaultSalaId = null
  try {
    const salas = $app.findRecordsByFilter('salas', '', '', 1, 0)
    if (salas && salas.length > 0) defaultSalaId = salas[0].id
  } catch (e) {}

  let bloqueios = []
  try {
    bloqueios = $app.findRecordsByFilter('bloqueios', '', '', 0, 0)
  } catch (e) {}

  const checkOverlap = (aStartMs, aEndMs, bStartMs, bEndMs) => {
    return aStartMs < bEndMs && aEndMs > bStartMs
  }

  for (const medico of medicos) {
    let configs = medico.get('horarios_fixos')
    if (!configs) continue

    if (typeof configs === 'string') {
      try {
        configs = JSON.parse(configs)
      } catch (e) {
        configs = null
      }
    }

    if (!configs) continue
    if (!Array.isArray(configs)) configs = [configs]

    for (const config of configs) {
      const dias_semana = config.dias_semana || []
      const horarios = config.horarios || []
      const sala_id = config.sala_id || defaultSalaId

      if (!sala_id || dias_semana.length === 0 || horarios.length === 0) continue

      for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const date = new Date(year, month, day)
        if (!dias_semana.includes(date.getDay())) continue

        for (const hor of horarios) {
          const partsI = hor.inicio.split(':')
          const partsF = hor.fim.split(':')
          const resStart = new Date(year, month, day, parseInt(partsI[0]), parseInt(partsI[1]), 0)
          const resEnd = new Date(year, month, day, parseInt(partsF[0]), parseInt(partsF[1]), 0)

          const sStr = resStart.toISOString().replace('T', ' ')
          const fStr = resEnd.toISOString().replace('T', ' ')

          let isDuplicate = false
          try {
            const filter =
              'medico_id = {:medico_id} && sala_id = {:sala_id} && data_inicio = {:start} && data_fim = {:end}'
            const existing = $app.findFirstRecordByFilter('reservas', filter, {
              medico_id: medico.id,
              sala_id: sala_id,
              start: sStr,
              end: fStr,
            })
            if (existing) isDuplicate = true
          } catch (e) {}

          if (isDuplicate) continue

          const realDateStr =
            year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')

          let isBlocked = false
          for (const b of bloqueios) {
            if (b.get('sala_id') !== sala_id) continue

            let isDayApplicable = false
            const tipo = b.getString('tipo')
            const bDataInicio = b.getString('data_inicio')
            const bDataFim = b.getString('data_fim')
            const bHoraInicio = b.getString('hora_inicio')
            const bHoraFim = b.getString('hora_fim')

            if (tipo === 'pontual' || tipo === 'periodo') {
              if (bDataInicio && bDataFim) {
                if (realDateStr >= bDataInicio && realDateStr <= bDataFim) isDayApplicable = true
              } else if (bDataInicio === realDateStr) {
                isDayApplicable = true
              }
            } else if (tipo === 'diario') {
              isDayApplicable = true
            } else if (tipo === 'semanal') {
              const bdias = b.get('dias_semana')
              if (bdias && Array.isArray(bdias) && bdias.includes(date.getDay())) {
                isDayApplicable = true
              }
            }

            if (!isDayApplicable) continue

            if (bHoraInicio && bHoraFim) {
              const bpI = bHoraInicio.split(':')
              const bpF = bHoraFim.split(':')
              const bStartMs = new Date(
                year,
                month,
                day,
                parseInt(bpI[0]),
                parseInt(bpI[1]),
                0,
              ).getTime()
              const bEndMs = new Date(
                year,
                month,
                day,
                parseInt(bpF[0]),
                parseInt(bpF[1]),
                0,
              ).getTime()
              if (checkOverlap(resStart.getTime(), resEnd.getTime(), bStartMs, bEndMs)) {
                isBlocked = true
                break
              }
            } else {
              isBlocked = true
              break
            }
          }

          if (isBlocked) continue

          try {
            const reservasCol = $app.findCollectionByNameOrId('reservas')
            const newReserva = new Record(reservasCol)
            newReserva.set('medico_id', medico.id)
            newReserva.set('sala_id', sala_id)
            newReserva.set('data_inicio', resStart.toISOString())
            newReserva.set('data_fim', resEnd.toISOString())
            newReserva.set('status', 'ativa')
            $app.save(newReserva)
          } catch (e) {
            console.log('Error creating cron reserva', e)
          }
        }
      }
    }
  }
})
