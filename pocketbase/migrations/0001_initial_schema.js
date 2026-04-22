migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('tipo_acesso')) {
      users.fields.add(
        new SelectField({
          name: 'tipo_acesso',
          values: ['clinica', 'medico'],
          maxSelect: 1,
        }),
      )
    }

    users.listRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')"
    users.viewRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')"
    users.updateRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')"
    users.deleteRule = "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'"

    app.save(users)

    const medicos = new Collection({
      name: 'medicos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')",
      viewRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')",
      createRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      updateRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')",
      deleteRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          required: true,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'especialidade', type: 'text' },
        { name: 'tipo', type: 'select', values: ['mensalista', 'avulso'], maxSelect: 1 },
        { name: 'email', type: 'email' },
        { name: 'telefone', type: 'text' },
        { name: 'horarios_fixos', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_medicos_usuario ON medicos (usuario_id)'],
    })
    app.save(medicos)

    const salas = new Collection({
      name: 'salas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      updateRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      deleteRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'status', type: 'select', values: ['ativa', 'inativa'], maxSelect: 1 },
        { name: 'horario_inicio', type: 'text' },
        { name: 'horario_fim', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(salas)

    const reservas = new Collection({
      name: 'reservas',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (medico_id.usuario_id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')",
      viewRule:
        "@request.auth.id != '' && (medico_id.usuario_id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')",
      createRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      updateRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      deleteRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      fields: [
        {
          name: 'medico_id',
          type: 'relation',
          collectionId: medicos.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'sala_id', type: 'relation', collectionId: salas.id, maxSelect: 1, required: true },
        { name: 'data_inicio', type: 'date' },
        { name: 'data_fim', type: 'date' },
        { name: 'status', type: 'select', values: ['ativa', 'cancelada'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(reservas)

    const agendamentos = new Collection({
      name: 'agendamentos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (reserva_id.medico_id.usuario_id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')",
      viewRule:
        "@request.auth.id != '' && (reserva_id.medico_id.usuario_id = @request.auth.id || @request.auth.tipo_acesso = 'clinica')",
      createRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      updateRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      deleteRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      fields: [
        {
          name: 'reserva_id',
          type: 'relation',
          collectionId: reservas.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'paciente_nome', type: 'text', required: true },
        { name: 'paciente_telefone', type: 'text' },
        { name: 'hora_inicio', type: 'date' },
        { name: 'hora_fim', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['confirmado', 'pendente', 'realizado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(agendamentos)

    const bloqueios = new Collection({
      name: 'bloqueios',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      updateRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      deleteRule: "@request.auth.id != '' && @request.auth.tipo_acesso = 'clinica'",
      fields: [
        { name: 'sala_id', type: 'relation', collectionId: salas.id, maxSelect: 1, required: true },
        {
          name: 'tipo',
          type: 'select',
          values: ['pontual', 'diario', 'semanal', 'mensal', 'periodo'],
          maxSelect: 1,
          required: true,
        },
        { name: 'data_inicio', type: 'text' },
        { name: 'data_fim', type: 'text' },
        { name: 'hora_inicio', type: 'text' },
        { name: 'hora_fim', type: 'text' },
        { name: 'dias_semana', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(bloqueios)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('bloqueios'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('agendamentos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('reservas'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('salas'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('medicos'))
    } catch (_) {}
    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      users.fields.removeByName('tipo_acesso')
      app.save(users)
    } catch (_) {}
  },
)
