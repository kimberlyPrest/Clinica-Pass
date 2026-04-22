onRecordCreateRequest((e) => {
  const body = e.requestInfo().body
  if (body.hora_inicio && body.hora_fim) {
    const start = new Date(body.hora_inicio)
    const end = new Date(body.hora_fim)
    if ((end - start) / 60000 < 60) {
      throw new BadRequestError('Duração mínima da consulta: 1 hora')
    }
  }
  e.next()
}, 'agendamentos')
