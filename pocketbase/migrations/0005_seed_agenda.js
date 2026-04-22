migrate((app) => {
  const users = app.findCollectionByNameOrId('_pb_users_auth_')
  const medicos = app.findCollectionByNameOrId('medicos')
  const salas = app.findCollectionByNameOrId('salas')
  const reservas = app.findCollectionByNameOrId('reservas')
  const agendamentos = app.findCollectionByNameOrId('agendamentos')

  // 1. Create Salas
  const salaNomes = ['Sala 1', 'Sala 2', 'Sala 3']
  const salaIds = []
  for (const nome of salaNomes) {
    try {
      const record = app.findFirstRecordByData('salas', 'nome', nome)
      salaIds.push(record.id)
    } catch (_) {
      const record = new Record(salas)
      record.set('nome', nome)
      record.set('status', 'ativa')
      record.set('horario_inicio', '09:00')
      record.set('horario_fim', '19:00')
      app.save(record)
      salaIds.push(record.id)
    }
  }

  // 2. Create Medicos
  const medicosData = [
    { nome: 'Dr. Carlos Oliveira', email: 'carlos@clinica.com' },
    { nome: 'Dra. Ana Silva', email: 'ana@clinica.com' },
    { nome: 'Dr. Felipe Santos', email: 'felipe@clinica.com' },
  ]
  const medicoIds = []

  for (const m of medicosData) {
    let userId
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', m.email)
      userId = user.id
    } catch (_) {
      const user = new Record(users)
      user.setEmail(m.email)
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', m.nome)
      user.set('tipo_acesso', 'medico')
      app.save(user)
      userId = user.id
    }

    try {
      const record = app.findFirstRecordByData('medicos', 'email', m.email)
      medicoIds.push(record.id)
    } catch (_) {
      const record = new Record(medicos)
      record.set('usuario_id', userId)
      record.set('nome', m.nome)
      record.set('especialidade', 'Clínico Geral')
      record.set('tipo', 'mensalista')
      record.set('email', m.email)
      app.save(record)
      medicoIds.push(record.id)
    }
  }

  // 3. Generate Schedule Data
  const now = new Date()
  const pacientes = [
    'João Pereira',
    'Maria Costa',
    'Pedro Alves',
    'Juliana Rocha',
    'Lucas Martins',
    'Fernanda Gomes',
  ]

  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - 3 + i)

    // 2 reservations per day
    for (let j = 0; j < 2; j++) {
      const startHour = 9 + j * 4 // 09:00 and 13:00

      const startDate = new Date(d)
      startDate.setHours(startHour, 0, 0, 0)

      const endDate = new Date(d)
      endDate.setHours(startHour + 2, 0, 0, 0) // 2 hours duration

      const medicoId = medicoIds[(i + j) % medicoIds.length]
      const salaId = salaIds[(i + j) % salaIds.length]

      try {
        const startStr = startDate.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
        app.findFirstRecordByData('reservas', 'data_inicio', startStr)
      } catch (_) {
        const reserva = new Record(reservas)
        reserva.set('medico_id', medicoId)
        reserva.set('sala_id', salaId)
        reserva.set('data_inicio', startDate.toISOString())
        reserva.set('data_fim', endDate.toISOString())
        reserva.set('status', 'ativa')
        app.save(reserva)

        for (let k = 0; k < 2; k++) {
          const aStart = new Date(startDate)
          aStart.setHours(startHour + k, 0, 0, 0)
          const aEnd = new Date(aStart)
          aEnd.setHours(startHour + k + 1, 0, 0, 0)

          const agendamento = new Record(agendamentos)
          agendamento.set('reserva_id', reserva.id)
          agendamento.set('paciente_nome', pacientes[(i + j + k) % pacientes.length])
          agendamento.set('paciente_telefone', '11999999999')
          agendamento.set('hora_inicio', aStart.toISOString())
          agendamento.set('hora_fim', aEnd.toISOString())
          agendamento.set('status', 'confirmado')
          app.save(agendamento)
        }
      }
    }
  }
})
