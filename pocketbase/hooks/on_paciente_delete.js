onRecordDeleteRequest((e) => {
  const now = new Date().toISOString()
  const phone = e.record.getString('telefone')

  let hasFuture = false
  try {
    $app.findFirstRecordByFilter(
      'agendamentos',
      'paciente_telefone = {:phone} && hora_inicio >= {:now}',
      { phone: phone, now: now },
    )
    hasFuture = true
  } catch (err) {}

  if (hasFuture) {
    throw new BadRequestError('Não é possível excluir paciente com agendamentos futuros.')
  }

  e.next()
}, 'pacientes')
