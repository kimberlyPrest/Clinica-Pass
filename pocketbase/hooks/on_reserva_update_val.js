onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  const startStr = body.data_inicio || e.record.getString('data_inicio')
  const endStr = body.data_fim || e.record.getString('data_fim')

  if (startStr && endStr) {
    const start = new Date(startStr)
    const end = new Date(endStr)
    if ((end - start) / 60000 < 60) {
      throw new BadRequestError('Duração mínima: 1 hora')
    }
  }
  e.next()
}, 'reservas')
