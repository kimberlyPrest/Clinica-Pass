# Relatório de Pendências — Clinica Pass

**Data:** 22 de abril de 2026  
**Base:** Gap Analysis original + Plano de Implementação (Fases 1–10)  
**Escopo:** Apenas itens do relatório original que **não foram cobertos** pelo plano de implementação

> Este relatório lista exclusivamente o que **não entrou** no plano de implementação (frontend only). Itens do plano já implementados nas Fases 1–10 foram removidos deste documento.

---

## Legenda

- ❌ Não implementado e **não está no plano**
- ⚠️ Implementado parcialmente / problema conhecido e **não está no plano**

---

## 1. DASHBOARD CLÍNICA

### 1.1 Dados Reais no Dashboard

> **Contexto:** O Plano de Implementação (Fases 2.1–2.4) cobriu a reconexão do dashboard com dados reais. Segue abaixo o que ficou **fora** do plano.

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Filtros — Tipo de médico (avulso/mensalista) como multiselect de checkbox | ⚠️ | UI existe, mas o plano conecta o filtro ao dado real sem garantir o multiselect de checkbox conforme escopo |
| Filtros — Ocupação (Slider 0%–100%) | ⚠️ | O plano registra que o slider filtra salas pelo percentual calculado, mas não especifica a UI do slider com range visual |
| Cards com degradê `#f7e6dc → #05807f` | ⚠️ | Fidelidade de degradê ao design system não validada — não consta no plano |

---

## 2. MÉDICOS — VISÃO CLÍNICA

### 2.1 Modal de Cadastro/Edição

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Modal — Senha na **criação**: criar usuário vinculado no `users` do PocketBase | ⚠️ | O plano (5.1) trata apenas edição de senha. A criação do registro em `users` junto ao médico não foi especificada |
| Modal — Campo Email habilitado na edição | ⚠️ | Plano 5.1A prevê habilitar edição de email — incluído no plano mas não confirmado como executado |

### 2.2 Subpágina Detalhes do Médico (`/medicos/:id`)

> O plano cobriu parcialmente via Fase 4.1. Os itens abaixo **não foram contemplados**.

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Card KPI — Nº consultas no mês / pacientes atendidos | ❌ | Não está na Fase 4 do plano |
| Card KPI — Horas agendadas no mês | ❌ | Não está na Fase 4 do plano |
| Filtrar estatísticas por mês anterior / outros períodos | ⚠️ | Plano 4.1A prevê controle de período, mas apenas navegação simples — não multiselect de mês/ano |
| Lista de todos os pacientes agendados por slot de horário (popover) | ⚠️ | Plano 4.1C prevê Popover, mas a busca dos agendamentos por slot não foi detalhada o suficiente |

---

## 3. SALAS — VISÃO CLÍNICA

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Bloqueio Recorrência Complexa — UI para criar ("2º domingo de cada mês") | ❌ | **Não está em nenhuma fase do plano** — tipo existe no schema sem UI nem lógica de avaliação |
| Reservas ocupadas na AgendaSala com cor `#05807f` semi-transparente (fidelidade exata) | ⚠️ | A implementação da 10.2 renderiza blocos, mas fidelidade exata de cor não foi especificada no plano |

---

## 4. AGENDA GERAL — VISÃO CLÍNICA

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Modal Agendar — Seletor de Sala exibir **apenas salas livres** no horário selecionado | ⚠️ | O plano não especificou a filtragem de salas ocupadas no `BookingModal` — seletor atual mostra todas as salas |
| Modal Agendar — Duração mínima obrigatória de **1 hora** (validação de input) | ⚠️ | Regra de negócio documentada mas não endereçada em nenhuma fase do plano |
| Cores diferenciam médicos ou status nos blocos de calendário | ⚠️ | Parcialmente implementado — sem especificação de paleta por médico no plano |

---

## 5. VISÃO MÉDICO — DASHBOARD

### 5.1 Engine de Mensalistas

> O plano cobriu visualização (Fase 8.1) e o modal de edição (Fase 8.2). Os itens abaixo **não foram cobertos**.

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Engine automática: converter horários fixos em reservas ao início do mês | ❌ | **Completamente fora do plano** — campo `horarios_fixos` existe no banco sem nenhum processo que crie reservas automaticamente |
| Exibir grade de horários fixos no modal de **cadastro** (não apenas edição) | ⚠️ | Plano 5.1B trata a grade no modal de médico — verificar se cobre a criação |

### 5.2 Card Tipo de Acesso — Mensalista

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Ação "Reservar mais horários" com **contexto** de horários fixos já existentes | ❌ | Plano 8.1C navega para `/medico/reservas` com `location.state`, mas sem injetar contexto real dos fixos |

---

## 6. VISÃO MÉDICO — RESERVAS DE SALA

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Agendar **múltiplos horários não contínuos** por vez | ❌ | **Não está em nenhuma fase do plano** |
| Modal Reserva — Calendário visual com datas/horas indisponíveis desabilitadas (cobertura de bloqueios recorrentes complexos) | ⚠️ | `recorrencia_complexa` sem lógica de avaliação — não endereçado no plano |
| Modal Reserva — Confirmação com **resumo completo** antes de confirmar | ⚠️ | Plano 10.1 trata apenas animação de sucesso — resumo completo não especificado |
| Se selecionar horário não reservado para agendamento → opção de criar reserva nova | ❌ | **Não está em nenhuma fase do plano** |
| Validação de duração mínima de 1h no modal do médico | ⚠️ | Verificar se regra está aplicada — não especificada no plano |
| Slider/input de duração com hora-fim calculada automaticamente | ⚠️ | Plano não especifica este detalhe de UX |

---

## 7. VISÃO MÉDICO — CALENDÁRIO

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Status nas consultas — tags Confirmado / Pendente / Realizado editáveis na UI | ⚠️ | Schema tem os status — sem especificação de edição/toggle no plano |
| Vista Lista — Horários sem consultas com destaque e botão rápido "Agendar Consulta" | ⚠️ | `MedicoListView.tsx` existe — verificar se o destaque e o botão estão implementados |

---

## 8. VISÃO MÉDICO — PACIENTES

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Ao clicar no card de paciente — exibir todos os campos customizáveis | ⚠️ | Campos existem no schema, verificar se a UI exibe todos |
| Configuração de **campos customizáveis por médico** (nas Configurações) | ❌ | **Não está em nenhuma fase do plano** — feature avançada |
| Registrar retorno / histórico do paciente / remédios contínuos (fluxo dedicado) | ❌ | **Não está em nenhuma fase do plano** |

---

## 9. REGRAS DE NEGÓCIO

| Regra | Status | Observação |
| --- | --- | --- |
| Soma de consultas ≤ duração da reserva + aviso | ⚠️ | Plano Fases 6.1–6.3 cobriam esta regra — incluídas no plano mas não confirmadas como executadas |
| Engine de horários fixos → geração automática de reservas mensais | ❌ | **Fora do plano** (apenas a UI de grade foi planejada, não o processo automático) |
| Bloqueio Recorrência Complexa — lógica de avaliação de datas | ❌ | **Fora do plano** — sem engine para avaliar padrões como "2º domingo do mês" |
| Remarcar = nova reserva quando necessário — fluxo completo | ⚠️ | Incompleto e não endereçado no plano |
| Médico não vê dados de outros médicos — verificação de cobertura em edge-cases | ⚠️ | API rules garantem, mas cobertura front (filtros manuais) não verificada no plano |

---

## 10. SIDEBAR E NAVEGAÇÃO

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Seção de Contexto (dropdown se médico mensalista) | ⚠️ | Fase 10.6 do plano previa — incluída no plano mas não confirmada como executada |
| Logo + Nome da Clínica com altura exata de 80px | ⚠️ | Detalhe visual não endereçado em nenhuma fase do plano |
| Cores `#f7e6dc` e `#05807f` — consistência em todos os elementos da sidebar | ⚠️ | Não especificado no plano |

---

## 11. DESIGN SYSTEM / UX

| Item do Escopo | Status | Observação |
| --- | --- | --- |
| Filtros como **chips selecionáveis** (não selects) — padronização | ⚠️ | Alguns como chips, outros como selects — inconsistência não tratada no plano |
| Dark mode (não previsto no escopo, está implementado via next-themes) | ⚠️ | Feature extra — pode ser removida ou mantida, não abordada no plano |
| Modal com display de resumo **antes** de confirmar reserva | ⚠️ | Plano só trata animação pós-confirmação — resumo pré-confirmação não especificado |

---

## 12. ITENS TÉCNICOS FORA DO PLANO

| Item | Prioridade | Observação |
| --- | --- | --- |
| Engine de geração automática de reservas para mensalistas | 🔴 Alta | Regra de negócio core — totalmente fora do plano frontend |
| Lógica de avaliação de bloqueio `recorrencia_complexa` | 🟡 Média | Tipo existe no schema e no front sem avaliação |
| Agendar múltiplos horários não contínuos por vez | 🟡 Média | Previsto no escopo, fora do plano |
| Campos customizáveis de paciente por médico (configuração) | 🟢 Baixa | Feature avançada |
| Fluxo de histórico/retorno de paciente | 🟢 Baixa | Campos existem, sem fluxo dedicado |
| Seletor de sala no BookingModal — filtrar apenas salas livres | 🟡 Média | UX incompleta |
| Tags de status de consulta editáveis na UI | 🟡 Média | Schema tem, UI não trata edição |
| Testes automatizados | 🟢 Baixa | 0% de cobertura — fora do escopo do plano |
| Validação de duração mínima de 1h nos modais | 🟡 Média | Regra de negócio sem garantia de validação |

---

## 13. RESUMO EXECUTIVO

| Categoria | Fora do Plano | Parcial/Não verificado |
| --- | --- | --- |
| Dashboard — Fidelidade visual (cores, chips) | — | ⚠️ |
| Médicos — Detalhes (KPIs, filtros avançados) | ❌ | — |
| Salas — Bloqueio recorrente complexo | ❌ | — |
| Reservas Médico — Múltiplos horários não contínuos | ❌ | — |
| Reservas Médico — Resumo pré-confirmação | — | ⚠️ |
| Engine mensalistas — Geração automática de reservas | ❌ | — |
| Bloqueio recorrência complexa — lógica de avaliação | ❌ | — |
| Pacientes — Campos customizáveis por médico | ❌ | — |
| Pacientes — Histórico/retorno dedicado | ❌ | — |
| Status de consultas editáveis na UI | — | ⚠️ |
| Seletor de sala filtrando livres no BookingModal | — | ⚠️ |
| Testes automatizados | ❌ | — |

**Estimativa de cobertura pós-plano:** O plano de implementação (Fases 1–10) cobriu aproximadamente **75–80% das funcionalidades** do escopo original. Os **20–25% restantes** concentram-se em:

1. 🔴 **Engine de mensalistas** (geração automática de reservas mensais)
2. 🔴 **Bloqueio de recorrência complexa** (lógica de avaliação)
3. 🟡 **Múltiplos horários não contínuos** em uma reserva
4. 🟡 **Campos customizáveis** de paciente por médico
5. 🟡 **Refinamentos de UX** (seletor de salas livres, status editáveis, chips consistentes)
