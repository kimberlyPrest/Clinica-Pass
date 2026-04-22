onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  const startStr = body.hora_inicio || e.record.getString('hora_inicio')
  const endStr = body.hora_fim || e.record.getString('hora_fim')

  if (startStr && endStr) {
    const start = new Date(startStr)
    const end = new Date(endStr)
    if ((end - start) / 60000 < 60) {
      throw new BadRequestError('Duração mínima da consulta: 1 hora')
    }
  }
  e.next()
}, 'agendamentos')
