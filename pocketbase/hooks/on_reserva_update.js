onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  const dataFim = body.data_fim

  if (dataFim) {
    let cutoff = false
    try {
      $app.findFirstRecordByFilter('agendamentos', 'reserva_id = {:id} && hora_fim > {:fim}', {
        id: e.record.id,
        fim: dataFim,
      })
      cutoff = true
    } catch (err) {}

    if (cutoff) {
      throw new BadRequestError(
        'Não é possível reduzir a reserva. Há agendamentos que excedem a nova duração.',
      )
    }
  }
  e.next()
}, 'reservas')
