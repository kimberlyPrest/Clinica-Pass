migrate(
  (app) => {
    const tables = [
      'agendamentos',
      'reservas',
      'bloqueios',
      'pacientes',
      'medico_campos_customizados',
      'medicos',
      'salas',
      'users',
    ]

    for (const table of tables) {
      app.db().newQuery(`DELETE FROM ${table}`).execute()
    }

    const usersCol = app.findCollectionByNameOrId('users')

    const admin = new Record(usersCol)
    admin.setEmail('kimberly@adapta.org')
    admin.setPassword('Skip@Pass')
    admin.setVerified(true)
    admin.set('name', 'Administrador')
    admin.set('tipo_acesso', 'clinica')

    app.save(admin)
  },
  (app) => {
    // Irreversible migration - data cannot be restored in a down migration
  },
)
