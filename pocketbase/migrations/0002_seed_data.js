migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const medicosCol = app.findCollectionByNameOrId('medicos')

    const seedUser = (email, name, tipo_acesso, password) => {
      try {
        return app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(usersCol)
        record.setEmail(email)
        record.setPassword(password)
        record.setVerified(true)
        record.set('name', name)
        record.set('tipo_acesso', tipo_acesso)
        app.save(record)
        return record
      }
    }

    const admin = seedUser('kimberly@adapta.org', 'Kimberly', 'clinica', 'Skip@Pass')
    const clinica = seedUser('clinica@example.com', 'Admin Clínica', 'clinica', '12345678')
    const carlos = seedUser('carlos@example.com', 'Dr. Carlos Oliveira', 'medico', '12345678')
    const ana = seedUser('ana@example.com', 'Dra. Ana Silva', 'medico', '12345678')
    const felipe = seedUser('felipe@example.com', 'Dr. Felipe Santos', 'medico', '12345678')

    const seedMedico = (user, especialidade, tipo) => {
      try {
        return app.findFirstRecordByData('medicos', 'usuario_id', user.id)
      } catch (_) {
        const m = new Record(medicosCol)
        m.set('usuario_id', user.id)
        m.set('nome', user.getString('name'))
        m.set('especialidade', especialidade)
        m.set('tipo', tipo)
        m.set('email', user.email())

        if (tipo === 'mensalista') {
          m.set('horarios_fixos', {
            monday: ['09:00', '10:00', '11:00'],
            wednesday: ['14:00', '15:00', '16:00'],
            friday: ['09:00', '10:00'],
          })
        }

        app.save(m)
        return m
      }
    }

    const mCarlos = seedMedico(carlos, 'Cardiologia', 'mensalista')
    const mAna = seedMedico(ana, 'Dermatologia', 'avulso')
    const mFelipe = seedMedico(felipe, 'Ortopedia', 'mensalista')

    const salasCol = app.findCollectionByNameOrId('salas')
    const reservasCol = app.findCollectionByNameOrId('reservas')
    const agendamentosCol = app.findCollectionByNameOrId('agendamentos')

    let sala1
    try {
      sala1 = app.findFirstRecordByData('salas', 'nome', 'Consultório 1')
    } catch (_) {
      sala1 = new Record(salasCol)
      sala1.set('nome', 'Consultório 1')
      sala1.set('status', 'ativa')
      app.save(sala1)
    }

    const today = new Date()

    const pacientes = [
      { nome: 'João Pereira', tel: '11999999991' },
      { nome: 'Maria Costa', tel: '11999999992' },
      { nome: 'Pedro Alves', tel: '11999999993' },
      { nome: 'Juliana Rocha', tel: '11999999994' },
      { nome: 'Lucas Martins', tel: '11999999995' },
    ]

    const seedReserva = (medico, diasOffset, horas, pacienteIdx) => {
      const d = new Date(today)
      d.setDate(d.getDate() + diasOffset)

      const start = new Date(d)
      start.setHours(horas, 0, 0, 0)

      const end = new Date(d)
      end.setHours(horas + 1, 0, 0, 0)

      try {
        app.findFirstRecordByData(
          'agendamentos',
          'paciente_nome',
          pacientes[pacienteIdx].nome + diasOffset,
        )
      } catch (_) {
        const r = new Record(reservasCol)
        r.set('medico_id', medico.id)
        r.set('sala_id', sala1.id)
        r.set('data_inicio', start.toISOString().replace('T', ' '))
        r.set('data_fim', end.toISOString().replace('T', ' '))
        r.set('status', 'ativa')
        app.save(r)

        const a = new Record(agendamentosCol)
        a.set('reserva_id', r.id)
        a.set('paciente_nome', pacientes[pacienteIdx].nome + diasOffset)
        a.set('paciente_telefone', pacientes[pacienteIdx].tel)
        a.set('hora_inicio', start.toISOString().replace('T', ' '))
        a.set('hora_fim', end.toISOString().replace('T', ' '))
        a.set('status', diasOffset < 0 ? 'realizado' : 'confirmado')
        app.save(a)
      }
    }

    // Seed mock bookings
    seedReserva(mCarlos, -10, 9, 0)
    seedReserva(mCarlos, -5, 14, 1)
    seedReserva(mCarlos, -1, 10, 2)
    seedReserva(mCarlos, 2, 11, 3)
    seedReserva(mCarlos, 5, 15, 4)

    seedReserva(mAna, -12, 10, 0)
    seedReserva(mAna, -4, 11, 1)
    seedReserva(mAna, -2, 14, 2)
    seedReserva(mAna, 1, 9, 3)
    seedReserva(mAna, 6, 16, 4)
  },
  (app) => {
    const deleteByEmail = (email) => {
      try {
        const rec = app.findAuthRecordByEmail('_pb_users_auth_', email)
        app.delete(rec)
      } catch (_) {}
    }

    deleteByEmail('kimberly@adapta.org')
    deleteByEmail('clinica@example.com')
    deleteByEmail('carlos@example.com')
    deleteByEmail('ana@example.com')
    deleteByEmail('felipe@example.com')

    app.db().newQuery('DELETE FROM medicos').execute()
  },
)
