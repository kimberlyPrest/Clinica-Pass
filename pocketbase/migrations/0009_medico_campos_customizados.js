migrate(
  (app) => {
    const collection = new Collection({
      name: 'medico_campos_customizados',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'medico_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('medicos').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome_campo', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['text', 'textarea', 'date', 'number'],
          maxSelect: 1,
        },
        { name: 'ativo', type: 'bool' },
        { name: 'ordem', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    const pacientesCol = app.findCollectionByNameOrId('pacientes')
    if (!pacientesCol.fields.getByName('dados_customizados')) {
      pacientesCol.fields.add(new JSONField({ name: 'dados_customizados' }))
    }
    app.save(pacientesCol)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('medico_campos_customizados')
      app.delete(collection)
    } catch (_) {}

    try {
      const pacientesCol = app.findCollectionByNameOrId('pacientes')
      pacientesCol.fields.removeByName('dados_customizados')
      app.save(pacientesCol)
    } catch (_) {}
  },
)
