onRecordCreateRequest((e) => {
  const body = e.requestInfo().body
  if (body.data_inicio && body.data_fim) {
    const start = new Date(body.data_inicio)
    const end = new Date(body.data_fim)
    if ((end - start) / 60000 < 60) {
      throw new BadRequestError('Duração mínima: 1 hora')
    }
  }
  e.next()
}, 'reservas')
