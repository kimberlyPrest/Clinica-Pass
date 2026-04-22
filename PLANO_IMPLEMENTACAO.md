# Plano de Implementação — Clinica-Pass (Frontend Only)
**Data:** 22 de abril de 2026  
**Escopo:** Apenas frontend/UI — sem alterações de banco, schema ou API rules do PocketBase

---

## Ordem das Fases

```
Fase 1 (Serviços) ──→ Fase 2 (Dashboard) ──→ Fase 3 (Salas)
Fase 1 (Serviços) ──→ Fase 4 (Detalhes Médico)
Fase 5 (Modal Médico)   → independente
Fase 6 (Validação)      → independente
Fase 7 (Autocomplete)   → após Fase 6 (compartilham os mesmos forms)
Fase 8 (Mensalistas)    → independente
Fase 9 (Configurações)  → independente
Fase 10 (UX menores)    → após Fases 2–4 estarem estáveis
```

---

## FASE 1 — Correção de Bug Crítico e Fundação de Serviços
**Complexidade:** Simples / Médio  
**Deve ser feita primeiro — as fases seguintes dependem dela**

---

### 1.1 Corrigir `getMedicos()` com suporte a busca e paginação

**Problema:** `getMedicos()` é chamado em `MedicosList.tsx` com `(page, debouncedSearch)`, mas a função não aceita parâmetros — ignora ambos e faz `getFullList`. Causa erro silencioso em runtime.

**Arquivo a modificar:** `src/services/medicos.ts`
- Alterar a assinatura para `getMedicos(page: number = 1, search: string = '')`
- Trocar `getFullList` por `getList(page, 10, { filter, sort, expand })`
- Filtro: `nome ~ "${search}" || email ~ "${search}" || especialidade ~ "${search}"` quando `search` não for vazio
- Retornar `{ items, totalItems }` (o componente já espera esse shape)

**Arquivo a verificar:** `src/pages/medicos/MedicosList.tsx`
- A chamada já está correta — nenhuma alteração necessária

---

### 1.2 Criar `src/services/dashboard.ts`

Novo arquivo centraliza as queries do dashboard. O `Index.tsx` vai importar daqui.

**Funções a criar:**

**`getDashboardKpis(filters)`**
- `occupancyRate`: busca reservas ativas do mês → soma minutos → divide por capacidade total das salas ativas (usando `horario_inicio`/`horario_fim` de cada sala)
- `activeDoctors`: count de médicos com ao menos uma reserva ativa no mês
- `availableRooms`: salas ativas sem reserva cujo `data_inicio <= agora <= data_fim`
- `upcomingAppointments`: count de agendamentos com `hora_inicio` nos próximos 7 dias

**`getDashboardLineChart(monthStart, monthEnd)`**
- Busca reservas do mês com `expand: 'sala_id'`
- Para cada dia: calcula `minutos_reservados / minutos_disponíveis × 100`
- Retorna `[{ day: '01', occupancy: 45 }, ...]`

**`getDashboardPieChart(monthStart, monthEnd)`**
- Busca reservas do mês com `expand: 'sala_id'`
- Agrupa por sala, soma minutos, calcula percentual
- Retorna `[{ name: 'Sala 1', value: 120, percent: 43 }, ...]`

**`getDashboardAppointments(start, end)`**
- Busca agendamentos com `hora_inicio` entre `agora-24h` e `agora+48h`
- Expand: `reserva_id,reserva_id.medico_id,reserva_id.sala_id`
- Mapeia para o tipo `Appointment` do dashboard (incluindo `patientPhone`)

---

### 1.3 Ampliar `src/services/salas.ts`

Adicionar duas funções:

**`getReservasPorSalaDoMes(salaId, monthStart, monthEnd)`**
- Query: `sala_id = "${salaId}" && data_inicio >= "${monthStart}" && data_inicio <= "${monthEnd}" && status = "ativa"`

**`getProximaReservaDaSala(salaId)`**
- Query: `sala_id = "${salaId}" && data_inicio > "${now}" && status = "ativa"`, sort: `data_inicio`, limit: 1
- Retorna `items[0]` ou `null`

---

## FASE 2 — Dashboard Clínica com Dados Reais
**Complexidade:** Complexo  
**Dependência:** Fase 1.2

---

### 2.1 Reconectar `src/pages/Index.tsx`

- Remover todos os imports de `mock-data.ts` (`generateDashboardData`, `MOCK_ROOMS`, `MOCK_DOCTOR_TYPES`)
- Remover o `useMemo` de `dashboardData` e o `Math.random() < 0.05` que simula erro artificial
- Adicionar `useState` para: `loading`, `kpiData`, `lineChartData`, `pieChartData`, `appointments`
- Adicionar `useEffect` que chama as 4 funções do novo `dashboard.ts`
- Data no subtítulo: usar `format(new Date(), "d 'de' MMMM", { locale: ptBR })` em vez de texto hardcoded
- **Integrar filtros ao fetch:**
  - `period` (Dia/Semana/Mês) → ajusta `start`/`end` das queries
  - `rooms` → filtra `pieData` e `appointments` pelo nome da sala
  - `doctorTypes` → filtra `appointments` pelo `tipo` do médico expandido
  - `occupancy` (slider) → filtra salas do pieChart pelo percentual calculado

### 2.2 Ajustar `src/components/dashboard/filters.tsx`

- Substituir constantes hardcoded `MOCK_ROOMS` e `MOCK_DOCTOR_TYPES` por props vindas do `Index.tsx`
- Adicionar às `FiltersProps`: `roomOptions: string[]` e `doctorTypeOptions: string[]`
- O `Index.tsx` deve carregar `getSalas()` e passar nomes reais para o painel

### 2.3 Ajustar `src/components/dashboard/types.ts`

- Adicionar `patientPhone?: string` ao tipo `Appointment`
- Adicionar `dateRange?: { start: Date; end: Date }` ao `DashboardFilters` (preparação para Fase 10.5)

### 2.4 Adicionar coluna "Telefone" em `src/components/dashboard/appointments-table.tsx`

- O componente já funciona — apenas adicionar a coluna na tabela desktop usando `appointment.patientPhone`
- Remover a simulação artificial de erro (o `index % 20 === 0` ou similar)

---

## FASE 3 — Taxa de Ocupação e Próximo Uso Reais das Salas
**Complexidade:** Médio  
**Dependência:** Fase 1.3

---

### 3.1 `src/pages/salas/SalasList.tsx`

- Ao carregar salas, fazer uma query paralela de reservas do mês inteiro (`Promise.all`)
- Agrupar reservas por `sala_id`, calcular `minutos_reservados` por sala
- Calcular capacidade mensal: `(horario_fim - horario_inicio) × dias_uteis_do_mes × 60 min` (usar campos `horario_inicio`/`horario_fim` da sala; fallback: 9h-19h)
- Taxa real = `minutos_reservados / minutos_disponíveis × 100`
- Para próximo uso: chamar `getProximaReservaDaSala(salaId)` por sala
- Armazenar em `Map<salaId, { ocupacao: number, proximoUso: string }>` e passar para `SalaCard`
- Substituir `mockOcupacao()` no filtro de ocupação pelo valor real do mapa

### 3.2 `src/pages/salas/components/SalaCard.tsx`

- Adicionar prop `proximoUso: string`
- Exibir no card em vez do valor mockado

---

## FASE 4 — Subpágina Detalhes do Médico
**Complexidade:** Médio  
**Dependência:** Fase 1.1

---

### 4.1 `src/pages/medicos/MedicoDetails.tsx`

A página já tem estrutura básica. Implementar o que falta:

**A) Controle de período nas estatísticas**
- Expor UI para alterar `statsPeriod`: botões `< Mês Anterior | Mês Atual >` ou um `Select` de mês/ano
- O `useMemo` de `stats` já calcula a partir do estado — só falta o controle visual

**B) Sala referenciada nos próximos horários**
- Garantir que o expand `reserva_id.sala_id` chegue nos dados
- Renderizar `a.expand?.reserva_id?.expand?.sala_id?.nome` em cada item da lista

**C) Grade de horários fixos para mensalistas com lista de pacientes**
- Exibir a grade visual compacta (mesma lógica do `MedicoFormModal`, versão read-only)
- Ao clicar em um slot preenchido: buscar agendamentos do médico naquele horário
- Exibir `Popover` com lista de pacientes do slot (nome + telefone)

**D) Verificar tabela de histórico**
- Confirmar que `a.expand?.reserva_id?.expand?.sala_id?.nome` renderiza corretamente
- A tabela com colunas Data, Paciente, Telefone, Sala, Duração, Status já está estruturada

---

## FASE 5 — Modal de Cadastro/Edição de Médico
**Complexidade:** Médio  
**Dependência:** nenhuma

---

### 5.1 `src/components/medicos/MedicoFormModal.tsx`

**A) Habilitar edição de email e senha**
- Campo `email`: remover `disabled={!!medico}` — habilitar na edição
- Campo `password`: adicionar seção colapsável "Alterar Acesso" que aparece apenas na edição (`{medico && ...}`)
- Campo "Nova Senha": opcional — se preenchida envia no update, se vazia não envia
- Usar `Collapsible` do shadcn para a seção

**B) Grade de horários fixos (verificar)**
- O escopo diz que está ausente, mas o código pode já ter implementado — verificar antes de reescrever
- Se ausente: adicionar grade visual (dias da semana × horários 9h-19h) com toggles para marcar horários
- Salva no campo `horarios_fixos` (JSON) que já existe no schema

---

## FASE 6 — Validação: Soma de Consultas ≤ Duração da Reserva
**Complexidade:** Médio  
**Dependência:** nenhuma

---

### 6.1 `src/lib/businessRules.ts`

Adicionar função:
```typescript
checkConsultasDuration(
  agendamentosExistentes: Agendamento[],
  novaConsulta: { inicio: Date; fim: Date },
  reserva: Reserva
) → { excede: boolean; minutosExcedidos: number }
```
Centralizar a lógica aqui para reusar nos dois formulários.

### 6.2 `src/pages/medico/components/AgendamentoCreateForm.tsx`

- O arquivo já tem uma verificação básica (bloqueia o campo duração)
- Substituir pelo `AlertDialog` com 3 opções quando exceder:
  1. **"Aumentar Reserva"** — verifica disponibilidade via `checkConflict`, chama `updateReserva` com nova `data_fim`
  2. **"Criar Nova Reserva"** — fecha e abre modal de nova reserva com data sugerida
  3. **"Ajustar Duração"** — volta ao formulário

### 6.3 `src/pages/medico/components/AgendamentoEditForm.tsx`

- Aplicar a mesma lógica de validação usando `checkConsultasDuration`

---

## FASE 7 — Autocomplete de Paciente nos Modais
**Complexidade:** Simples  
**Dependência:** Fase 6 (compartilham os mesmos forms)

---

### 7.1 Criar `src/hooks/use-paciente-autocomplete.ts`

Extrair a lógica já existente no `AgendamentoCreateForm` (que já tem autocomplete) para um hook reutilizável:
```typescript
usePacienteAutocomplete(medicoId: string) → {
  pacientes, filtered, showSuggestions,
  handleNameChange, selectPaciente, setShowSuggestions
}
```

### 7.2 `src/pages/agenda/BookingModal.tsx`

- Verificar se tem autocomplete de paciente
- Se não: usar o hook `usePacienteAutocomplete` com o `medicoId` selecionado no modal

### 7.3 `src/pages/gestao-reservas/components/ReservaEditarModal.tsx`

- Verificar e aplicar o mesmo hook se ausente

---

## FASE 8 — Engine de Mensalistas no Dashboard Médico
**Complexidade:** Complexo  
**Dependência:** nenhuma

---

### 8.1 `src/pages/medico/Dashboard.tsx`

**A) Substituir `<pre>JSON.stringify</pre>` pela grade visual**
- Exibir versão compacta e read-only da grade de horários fixos
- Reutilizar o mapa `DAYS`/`HOURS` já definido em outros arquivos

**B) Botão "Editar / Cancelar um dia específico" funcional**
- Abre `MensalistaEditModal` (novo componente)
- No modal: seletor de data + lista dos horários fixos daquele dia da semana
- Toggle "cancelar apenas este dia" → cria bloqueio pontual via `createBloqueio`
- Toggle "cancelar todos os dias" → cria bloqueio semanal recorrente

**C) Botão "Reservar Mais Horários"**
- Navega para `/medico/reservas` passando `location.state` com contexto de "reserva adicional mensalista"

### 8.2 Criar `src/pages/medico/components/MensalistaEditModal.tsx`

Props: `medico: Medico`, `open: boolean`, `onOpenChange: (v: boolean) => void`
- Seletor de data (Calendar + Popover do shadcn)
- Lista dos horários fixos do dia da semana selecionado (lidos de `medico.horarios_fixos`)
- Checkbox "Apenas este dia" vs "Todos os dias"
- Botão "Cancelar horário" que chama `createBloqueio` com o tipo correto

---

## FASE 9 — Página de Configurações
**Complexidade:** Complexo  
**Dependência:** nenhuma

---

### 9.1 `src/pages/configuracoes/Configuracoes.tsx`

Reescrever a página vazia com:

**Estrutura:** `<Tabs>` com abas "Usuários" e "Permissões"

### 9.2 Criar `src/components/configuracoes/UsuariosTable.tsx`

- Busca `pb.collection('users').getFullList()` (as API rules já permitem para a clínica)
- Tabela com colunas: Avatar, Nome, Email, Role (como Badge), Ações
- Ação: "Ver Perfil" → link para `/medicos/:id` quando médico

### 9.3 Criar `src/components/configuracoes/PermissoesTable.tsx`

- Lista estática de recursos do sistema com permissões por role
- Tabela: Recurso | Clínica | Médico Mensalista | Médico Avulso — cada célula com Toggle
- Persistir preferências em `localStorage` como JSON (enforcement é feito pelas API rules do PocketBase, não pelo frontend)
- Nota: os toggles são informativos/registro de preferência nesta fase — não alteram regras do banco

---

## FASE 10 — Features de UX Menores
**Complexidade:** Simples a Médio  
**Dependência:** Fases 2–4 devem estar estáveis

---

### 10.1 Animação ao confirmar reserva

**Arquivo:** `src/pages/medico/components/MedicoBookingModal.tsx`
- Após `createReserva` bem-sucedido, exibir estado de "sucesso" por 1.5s antes de fechar
- Usar ícone `CheckCircle2` com `animate-bounce` ou `animate-ping` do Tailwind
- Padrão já existe em toasts do sistema — estender para visual dentro do modal

---

### 10.2 Clique em espaço livre na Agenda da Sala → modal de agendamento

**Arquivo:** `src/pages/salas/components/AgendaSala.tsx`
- Substituir o `alert()` placeholder por estado `selectedSlot: { day: number; hour: number } | null`
- Ao clicar em célula vazia: setar `selectedSlot`
- Renderizar `BookingModal` reutilizado da agenda clínica, com sala e horário pré-preenchidos
- Carregar reservas reais para determinar quais células estão ocupadas (substituindo `MOCK_BLOCKS`)

---

### 10.3 Visualização em Lista na Agenda Clínica

**Arquivo:** `src/pages/agenda/Agenda.tsx`
- Adicionar `'list'` ao tipo de `view`
- Adicionar Tab "Lista" nos controles de visualização

**Criar:** `src/pages/agenda/ListView.tsx`
- Agrupar reservas por data
- Para cada data: header do dia + cards com médico, sala, pacientes, horário
- Reutilizar a estrutura visual do `MedicoListView.tsx` já existente

---

### 10.4 Filtro por paciente no Calendário Médico

**Arquivo:** `src/pages/medico/Calendario.tsx`
- Adicionar `Input` de busca por paciente no header
- Estado: `pacienteSearch: string`
- Filtragem client-side (nos dados já carregados) por `paciente_nome` ou `paciente_telefone` — sem nova query

---

### 10.5 Período personalizado na navegação da Agenda

**Arquivos:** `src/pages/agenda/Agenda.tsx` e `src/pages/medico/Calendario.tsx`
- Adicionar opção `'custom'` ao tipo de view
- Quando selecionada: exibir dois date pickers (início + fim) inline no header
- Usar `Calendar` + `Popover` do shadcn
- O `fetchData` usa `start = startOfDay(customStart)` e `end = endOfDay(customEnd)`

---

### 10.6 Dropdown de contexto na sidebar para mensalistas

**Arquivo:** `src/components/Layout.tsx`
- Carregar `medico` via `getMedicoByUserId(user.id)` no `LayoutContent` (um `useEffect` único)
- Quando `user.tipo_acesso === 'medico' && medico?.tipo === 'mensalista'`: renderizar seção de "Contexto" entre o header e os itens de navegação
- Conteúdo: `DropdownMenu` ou `Collapsible` com:
  - "Meus Horários Fixos" → abre sheet com a grade
  - "Reservar Horário Extra" → navega para `/medico/reservas`
  - "Próxima Reserva" → tooltip com a próxima reserva do mensalista

---

## Resumo de Arquivos por Fase

| Fase | Modificar | Criar | Complexidade |
|------|-----------|-------|--------------|
| 1.1 Bug getMedicos | `src/services/medicos.ts` | — | Simples |
| 1.2 Serviços Dashboard | — | `src/services/dashboard.ts` | Médio |
| 1.3 Serviços Salas | `src/services/salas.ts` | — | Simples |
| 2.1 Dashboard real | `src/pages/Index.tsx` | — | Complexo |
| 2.2 Filtros reais | `src/components/dashboard/filters.tsx` | — | Simples |
| 2.3 Tipos Dashboard | `src/components/dashboard/types.ts` | — | Simples |
| 2.4 Tabela agendamentos | `src/components/dashboard/appointments-table.tsx` | — | Simples |
| 3.1 Ocupação/Próximo uso | `src/pages/salas/SalasList.tsx` | — | Médio |
| 3.2 SalaCard prop | `src/pages/salas/components/SalaCard.tsx` | — | Simples |
| 4.1 Detalhes Médico | `src/pages/medicos/MedicoDetails.tsx` | — | Médio |
| 5.1 Modal Médico edição | `src/components/medicos/MedicoFormModal.tsx` | — | Médio |
| 6.1 businessRules | `src/lib/businessRules.ts` | — | Médio |
| 6.2 Create form validação | `src/pages/medico/components/AgendamentoCreateForm.tsx` | — | Médio |
| 6.3 Edit form validação | `src/pages/medico/components/AgendamentoEditForm.tsx` | — | Médio |
| 7.1 Hook autocomplete | — | `src/hooks/use-paciente-autocomplete.ts` | Simples |
| 7.2 BookingModal | `src/pages/agenda/BookingModal.tsx` | — | Simples |
| 7.3 ReservaEditarModal | `src/pages/gestao-reservas/components/ReservaEditarModal.tsx` | — | Simples |
| 8.1 Dashboard Mensalista | `src/pages/medico/Dashboard.tsx` | — | Complexo |
| 8.2 MensalistaEditModal | — | `src/pages/medico/components/MensalistaEditModal.tsx` | Complexo |
| 9.1 Configurações | `src/pages/configuracoes/Configuracoes.tsx` | — | Médio |
| 9.2 UsuariosTable | — | `src/components/configuracoes/UsuariosTable.tsx` | Médio |
| 9.3 PermissoesTable | — | `src/components/configuracoes/PermissoesTable.tsx` | Médio |
| 10.1 Animação reserva | `src/pages/medico/components/MedicoBookingModal.tsx` | — | Simples |
| 10.2 Clique espaço Sala | `src/pages/salas/components/AgendaSala.tsx` | — | Médio |
| 10.3 Lista Agenda Clínica | `src/pages/agenda/Agenda.tsx` | `src/pages/agenda/ListView.tsx` | Médio |
| 10.4 Filtro paciente Cal. | `src/pages/medico/Calendario.tsx` | — | Simples |
| 10.5 Período personalizado | `src/pages/agenda/Agenda.tsx`, `src/pages/medico/Calendario.tsx` | — | Simples |
| 10.6 Sidebar mensalista | `src/components/Layout.tsx` | — | Médio |
