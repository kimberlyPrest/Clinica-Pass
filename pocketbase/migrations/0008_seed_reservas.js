migrate(
  (app) => {
    const medicos = app.findRecordsByFilter('medicos', '1=1', '', 10, 0)
    const salas = app.findRecordsByFilter('salas', '1=1', '', 10, 0)

    if (medicos.length === 0 || salas.length === 0) return

    const reservasCol = app.findCollectionByNameOrId('reservas')
    const agendamentosCol = app.findCollectionByNameOrId('agendamentos')

    const pacientes = [
      'João Pereira',
      'Maria Costa',
      'Pedro Alves',
      'Juliana Rocha',
      'Lucas Martins',
    ]

    for (let i = 0; i < 25; i++) {
      const isAtiva = i % 5 !== 0 // ~80% ativa
      const medico = medicos[i % medicos.length]
      const sala = salas[i % salas.length]

      const date = new Date()
      date.setDate(date.getDate() + (i % 30))
      date.setHours(8 + (i % 8), 0, 0, 0)

      const dataInicio = date.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
      const dataFimDate = new Date(date)
      dataFimDate.setHours(date.getHours() + 4)
      const dataFim = dataFimDate.toISOString().replace('T', ' ').substring(0, 19) + 'Z'

      try {
        const reserva = new Record(reservasCol)
        reserva.set('medico_id', medico.id)
        reserva.set('sala_id', sala.id)
        reserva.set('data_inicio', dataInicio)
        reserva.set('data_fim', dataFim)
        reserva.set('status', isAtiva ? 'ativa' : 'cancelada')
        app.save(reserva)

        for (let j = 0; j < 2; j++) {
          const agendamento = new Record(agendamentosCol)
          agendamento.set('reserva_id', reserva.id)
          agendamento.set('paciente_nome', pacientes[(i + j) % pacientes.length])
          agendamento.set('paciente_telefone', '11999999999')

          const aInicio = new Date(date)
          aInicio.setHours(date.getHours() + j, 0, 0, 0)
          const aFim = new Date(aInicio)
          aFim.setMinutes(aFim.getMinutes() + 30)

          agendamento.set(
            'hora_inicio',
            aInicio.toISOString().replace('T', ' ').substring(0, 19) + 'Z',
          )
          agendamento.set('hora_fim', aFim.toISOString().replace('T', ' ').substring(0, 19) + 'Z')
          agendamento.set('status', isAtiva ? 'confirmado' : 'pendente')
          app.save(agendamento)
        }
      } catch (e) {
        console.log('Error seeding reserva/agendamento', e)
      }
    }
  },
  (app) => {
    // Down migration left intentionally empty as we can't reliably delete only seeded data without a marker.
  },
)
