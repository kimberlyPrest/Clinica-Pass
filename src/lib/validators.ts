import { z } from 'zod'

export const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/
export const nameRegex = /^[A-Za-zÀ-ÿ\s-]{3,100}$/

export const agendamentoSchema = z.object({
  nome: z.string().regex(nameRegex, 'Nome inválido (3-100 letras, apenas letras)'),
  telefone: z.string().regex(phoneRegex, 'Telefone inválido. Use (11) 99999-9999'),
  duration: z.number().min(60, 'Duração mínima da consulta: 1 hora').max(480, 'Máximo 8 horas'),
})

export function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      .trim()
      .replace(/-$/, '')
  }
  return numbers
    .replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    .trim()
    .replace(/-$/, '')
}
