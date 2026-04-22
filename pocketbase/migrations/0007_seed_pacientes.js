migrate(
  (app) => {
    const medicos = app.findRecordsByFilter('medicos', "nome ~ 'Carlos Oliveira'", '', 1, 0)
    if (!medicos || medicos.length === 0) return
    const medico = medicos[0]

    const pacientesData = [
      { nome: 'João Pereira', telefone: '(11) 98888-1111' },
      { nome: 'Maria Costa', telefone: '(11) 98888-2222' },
      { nome: 'Pedro Alves', telefone: '(11) 98888-3333' },
      { nome: 'Juliana Rocha', telefone: '(11) 98888-4444' },
      { nome: 'Lucas Martins', telefone: '(11) 98888-5555' },
      { nome: 'Fernanda Gomes', telefone: '(11) 98888-6666' },
      { nome: 'Roberto Dias', telefone: '(11) 98888-7777' },
    ]

    const col = app.findCollectionByNameOrId('pacientes')

    pacientesData.forEach((p) => {
      try {
        app.findFirstRecordByData('pacientes', 'nome', p.nome)
      } catch (_) {
        const record = new Record(col)
        record.set('medico_id', medico.id)
        record.set('nome', p.nome)
        record.set('telefone', p.telefone)
        app.save(record)
      }
    })

    const agendamentosCol = app.findCollectionByNameOrId('agendamentos')
    const reservas = app.findRecordsByFilter(
      'reservas',
      `medico_id = '${medico.id}'`,
      'data_inicio',
      1,
      0,
    )

    if (reservas.length > 0) {
      const reserva = reservas[0]
      let currentStart = new Date()
      currentStart.setDate(currentStart.getDate() - 5) // 5 days ago

      for (let i = 0; i < 10; i++) {
        const p = pacientesData[i % pacientesData.length]
        try {
          app.findFirstRecordByFilter(
            'agendamentos',
            `paciente_nome = '${p.nome}' && status = 'realizado' && reserva_id = '${reserva.id}'`,
          )
        } catch (_) {
          const agRecord = new Record(agendamentosCol)
          agRecord.set('reserva_id', reserva.id)
          agRecord.set('paciente_nome', p.nome)
          agRecord.set('paciente_telefone', p.telefone)

          const start = new Date(currentStart)
          start.setHours(9 + i, 0, 0, 0)
          const end = new Date(start)
          end.setHours(10 + i, 0, 0, 0)

          agRecord.set('hora_inicio', start.toISOString())
          agRecord.set('hora_fim', end.toISOString())
          agRecord.set('status', 'realizado')
          app.save(agRecord)
        }
      }
    }
  },
  (app) => {},
)
