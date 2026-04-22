migrate(
  (app) => {
    const collection = new Collection({
      name: 'pacientes',
      type: 'base',
      listRule: "@request.auth.tipo_acesso = 'clinica' || medico_id.usuario_id = @request.auth.id",
      viewRule: "@request.auth.tipo_acesso = 'clinica' || medico_id.usuario_id = @request.auth.id",
      createRule:
        "@request.auth.tipo_acesso = 'clinica' || medico_id.usuario_id = @request.auth.id",
      updateRule:
        "@request.auth.tipo_acesso = 'clinica' || medico_id.usuario_id = @request.auth.id",
      deleteRule:
        "@request.auth.tipo_acesso = 'clinica' || medico_id.usuario_id = @request.auth.id",
      fields: [
        {
          name: 'medico_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('medicos').id,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'telefone', type: 'text', required: true },
        { name: 'data_nascimento', type: 'date' },
        { name: 'cpf', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'endereco', type: 'text' },
        { name: 'anamnese', type: 'text' },
        { name: 'medicacoes', type: 'text' },
        { name: 'notas_internas', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_pacientes_medico ON pacientes (medico_id)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pacientes')
    app.delete(collection)
  },
)
