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
        app.findFirstRecordByData('medicos', 'usuario_id', user.id)
      } catch (_) {
        const m = new Record(medicosCol)
        m.set('usuario_id', user.id)
        m.set('nome', user.getString('name'))
        m.set('especialidade', especialidade)
        m.set('tipo', tipo)
        m.set('email', user.email())
        app.save(m)
      }
    }

    seedMedico(carlos, 'Cardiologia', 'mensalista')
    seedMedico(ana, 'Dermatologia', 'avulso')
    seedMedico(felipe, 'Ortopedia', 'mensalista')
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
