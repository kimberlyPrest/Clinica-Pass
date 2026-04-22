migrate(
  (app) => {
    // Update bloqueios collection to include recorrencia_complexa
    const bCol = app.findCollectionByNameOrId('bloqueios')
    const tipoField = bCol.fields.getByName('tipo')
    if (tipoField) {
      tipoField.values = [
        'pontual',
        'diario',
        'semanal',
        'mensal',
        'periodo',
        'recorrencia_complexa',
      ]
      app.save(bCol)
    }

    // Update salas collection to include dias_funcionamento
    const sCol = app.findCollectionByNameOrId('salas')
    if (!sCol.fields.getByName('dias_funcionamento')) {
      sCol.fields.add(new JSONField({ name: 'dias_funcionamento' }))
      app.save(sCol)
    }

    // Seed Data for Salas
    const seedSalas = [
      {
        nome: 'Consultório A',
        status: 'ativa',
        horario_inicio: '09:00',
        horario_fim: '19:00',
        dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex'],
      },
      {
        nome: 'Consultório B',
        status: 'ativa',
        horario_inicio: '09:00',
        horario_fim: '19:00',
        dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex'],
      },
      {
        nome: 'Consultório C',
        status: 'ativa',
        horario_inicio: '10:00',
        horario_fim: '18:00',
        dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex'],
      },
    ]

    for (const s of seedSalas) {
      try {
        app.findFirstRecordByData('salas', 'nome', s.nome)
      } catch (_) {
        const record = new Record(sCol)
        record.set('nome', s.nome)
        record.set('status', s.status)
        record.set('horario_inicio', s.horario_inicio)
        record.set('horario_fim', s.horario_fim)
        record.set('dias_funcionamento', s.dias_funcionamento)
        app.save(record)
      }
    }

    // Retrieve IDs for seeding Bloqueios
    const sA = app.findFirstRecordByData('salas', 'nome', 'Consultório A')
    const sB = app.findFirstRecordByData('salas', 'nome', 'Consultório B')

    // Seed Data for Bloqueios
    const seedBloqueios = [
      {
        sala_id: sA.id,
        tipo: 'diario',
        hora_inicio: '12:00',
        hora_fim: '13:00',
        dias_semana: ['seg', 'ter', 'qua', 'qui', 'sex'],
      },
      {
        sala_id: sB.id,
        tipo: 'pontual',
        data_inicio: '2024-12-25',
        data_fim: '2024-12-25',
        hora_inicio: '00:00',
        hora_fim: '23:59',
      },
      { sala_id: sA.id, tipo: 'periodo', data_inicio: '2025-04-15', data_fim: '2025-04-20' },
    ]

    for (const b of seedBloqueios) {
      try {
        const bRec = new Record(bCol)
        bRec.set('sala_id', b.sala_id)
        bRec.set('tipo', b.tipo)
        bRec.set('hora_inicio', b.hora_inicio || null)
        bRec.set('hora_fim', b.hora_fim || null)
        bRec.set('data_inicio', b.data_inicio || null)
        bRec.set('data_fim', b.data_fim || null)
        bRec.set('dias_semana', b.dias_semana || null)
        app.save(bRec)
      } catch (e) {}
    }
  },
  (app) => {},
)
