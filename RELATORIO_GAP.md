# Relatório de Gap Analysis — Clinica Pass
**Data:** 22 de abril de 2026  
**Status do sistema:** ~65% implementado

---

## Legenda
- ✅ Implementado
- ⚠️ Implementado parcialmente / com problemas
- ❌ Não implementado

---

## 1. VISÃO CLÍNICA

### 1.1 Dashboard Clínica

| Item do Escopo | Status | Observação |
|---|---|---|
| Cards KPI — Taxa de Ocupação Geral (%) | ⚠️ | Dados mockados (`generateDashboardData`), não lê do banco real |
| Cards KPI — Médicos Ativos | ⚠️ | Mockado |
| Cards KPI — Salas Disponíveis Agora | ⚠️ | Mockado |
| Cards KPI — Agendamentos Próximos 7 Dias | ⚠️ | Mockado |
| Gráfico de linha — Ocupação por dia do mês | ⚠️ | Componente existe, dados mockados |
| Gráfico de pizza — Distribuição por sala | ⚠️ | Componente existe, dados mockados |
| Tabela: Próximos Agendamentos (últimas 24h e próximas 48h) | ⚠️ | Tabela existe, simula 5% de taxa de erro artificialmente no código |
| Tabela deve mostrar: nome, telefone, hora, médico, sala | ⚠️ | Estrutura existe, mas dados vêm de mock |
| Filtros — chips: Dia, Mês, Semana | ⚠️ | UI existe mas não filtra dados reais |
| Filtros — Sala (Checkboxes multiselect) | ⚠️ | UI existe mas não filtra dados reais |
| Filtros — Médico (Checkboxes, multiselect, tipo avulso/mensalista) | ⚠️ | UI existe mas não filtra dados reais |
| Filtros — Ocupação (Slider 0% a 100%) | ⚠️ | UI existe mas não filtra dados reais |
| Tooltips ao passar sobre gráficos | ✅ | Implementado via Recharts |
| Cards com degradê `#f7e6dc → #05807f` | ⚠️ | Visual aplicado mas verificar fidelidade ao design system |

**Problema crítico:** Todo o Dashboard usa dados gerados por funções de mock. Nenhum KPI ou gráfico reflete dados reais do banco PocketBase.

---

### 1.2 Médicos (Visão Clínica)

| Item do Escopo | Status | Observação |
|---|---|---|
| Campo de busca (nome, email, especialidade) | ⚠️ | UI existe, mas `getMedicos()` no serviço não aceita parâmetros de busca/paginação — erro em runtime |
| Botão "+ Novo Médico" | ✅ | Implementado |
| Tabela de médicos com todos os cadastrados | ⚠️ | Existe, mas busca/paginação com bug de assinatura de função |
| Badge visual para mensalistas (`#f7e6dc` / texto `#05807f`) | ✅ | Implementado |
| Modal Editar/Cadastro Médico | ⚠️ | Existe mas falta campos obrigatórios do escopo |
| Modal — Toggle Mensalista / Avulso | ✅ | Implementado |
| Modal — Grade horários fixos para mensalista (seg-sex, 9h-19h) | ❌ | Não implementado — campo `horarios_fixos` existe no banco mas sem UI de grade |
| Modal — Opção de editar horários fixos | ❌ | Não implementado |
| Modal — Campo Email | ✅ | Implementado |
| Modal — Campo Senha (para criar acesso ao sistema) | ⚠️ | Campo existe, mas a criação do usuário (`users`) vinculado ao médico não está clara na implementação |
| Editar médico — alterar senha e email | ❌ | Não está implementado no modal de edição |

#### 1.2.1 Subpágina — Detalhes do Médico (`/medicos/:id`)

| Item do Escopo | Status | Observação |
|---|---|---|
| Histórico de Reservas (tabela com scroll horizontal) | ❌ | Não implementado |
| Próximos Horários Reservados com sala referenciada | ❌ | Não implementado |
| Para mensalista: mostrar grade fixa | ❌ | Não implementado |
| Em cada horário reservado: lista de todos os pacientes agendados | ❌ | Não implementado |
| Card de Reservas — Nº consultas no mês / pacientes atendidos | ❌ | Não implementado |
| Card de Reservas — Horas agendadas no mês | ❌ | Não implementado |
| Filtrar card de reservas por outros meses/períodos | ❌ | Não implementado |

---

### 1.3 Salas (Visão Clínica)

| Item do Escopo | Status | Observação |
|---|---|---|
| Filtros superiores | ⚠️ | Filtros existem (nome, status, ocupação) mas ocupação é mockada |
| Cards de Salas — Nome da sala | ✅ | Implementado |
| Cards de Salas — Status (Ativa/Inativa) | ✅ | Implementado |
| Cards de Salas — Próximo uso (horário ou data) | ❌ | Campo mostrado mas dados são mockados com `Math.random()` |
| Cards de Salas — Taxa de ocupação do mês | ❌ | Mockada com `mockOcupacao()` — não calcula do banco real |
| Cards de Salas — Botão Editar | ✅ | Implementado |
| Cards de Salas — Botão Bloquear | ✅ | Existe modal |
| Modal Configurar Sala — Horário de Funcionamento (início/fim) | ✅ | Implementado |
| Modal Configurar Sala — Toggle por dia da semana | ✅ | Implementado |
| Modal Bloqueios — Botão "+ Adicionar Bloqueio" | ✅ | Existe |
| Bloqueio Pontual (data + hora específica) | ✅ | Implementado |
| Bloqueio Diário (cada dia X) | ✅ | Implementado |
| Bloqueio Semanal (cada semana no dia X) | ✅ | Implementado |
| Bloqueio Mensal (dia X de cada mês) | ✅ | Implementado |
| Bloqueio por Período (de data A até data B) | ✅ | Implementado |
| Bloqueio Recorrência Complexa ("2º domingo de cada mês") | ❌ | Tipo `recorrencia_complexa` existe no schema mas sem UI e sem lógica de avaliação |
| Modal Adicionar Sala — Nome da Sala | ✅ | Implementado |
| Modal Adicionar Sala — Horário de funcionamento | ✅ | Implementado |
| Agenda Visual da Sala (expandir ao clicar) | ✅ | `AgendaSala.tsx` implementado |
| Vista estilo Google Calendar (semana/mês/dia) | ✅ | Implementado |
| Reservas ocupadas em `#05807f` semi-transparente | ⚠️ | Visual existe, verificar fidelidade de cor |
| Espaços livres em branco | ✅ | Implementado |
| Clique em espaço livre → Modal para agendar manualmente | ❌ | Não implementado no `AgendaSala` |

---

### 1.4 Agenda Geral (Visão Clínica)

| Item do Escopo | Status | Observação |
|---|---|---|
| Navegação < Hoje > | ✅ | Implementado |
| Navegação por Semana, Mês, Período personalizado | ⚠️ | Dia/Semana/Mês implementados; período personalizado não |
| Filtro por Médico | ✅ | Implementado |
| Filtro por Sala | ✅ | Implementado |
| Botão "+ Reservar Manualmente" | ✅ | Implementado |
| Visualização por Dia — Eixo vertical 09h-19h | ✅ | Implementado |
| Bloco: Nome do Médico (negrito, `#05807f`) | ✅ | Implementado |
| Bloco: Paciente(s) (nome e telefone) | ✅ | Implementado |
| Bloco: Hora (09:00-10:00) | ✅ | Implementado |
| Bloco: Sala (canto superior direito do bloco) | ✅ | Implementado |
| Hover → Tooltip com todos os pacientes (nome + telefone) | ✅ | Implementado |
| Click → Modal com detalhes da reserva e lista de pacientes | ✅ | Implementado |
| Visualização por Semana/Mês — Cards empilhados | ✅ | Implementado |
| Cores diferenciam médicos ou status | ⚠️ | Implementado parcialmente |
| Modal Agendar Manualmente — Seletor de Médico (autocomplete) | ✅ | Implementado |
| Modal Agendar Manualmente — Seletor de Data | ✅ | Implementado |
| Modal Agendar Manualmente — Seletor de Sala (apenas livres no horário) | ⚠️ | Existe seletor mas validação de conflito precisa ser verificada |
| Modal Agendar Manualmente — Seletor de Hora (blocos mínimo 1h) | ⚠️ | Existe, verificar validação de mínimo 1h |
| Visualização em forma de Lista (alternativa ao calendário) | ❌ | Não implementado |

---

### 1.5 Gestão (Visão Clínica)

| Item do Escopo | Status | Observação |
|---|---|---|
| Lista com filtros de todas as reservas realizadas | ✅ | Implementado em `/gestao-reservas` |
| Filtro por período (hoje/semana/mês) | ✅ | Implementado |
| Filtro por status | ✅ | Implementado |
| Filtro por médico | ✅ | Implementado |
| Filtro por sala | ✅ | Implementado |
| Busca por nome do médico ou paciente | ✅ | Implementado |
| Modal editar reserva | ✅ | Implementado |
| Modal cancelar reserva | ✅ | Implementado |
| Modal ver detalhes | ✅ | Implementado |

---

### 1.6 Configurações (Visão Clínica)

| Item do Escopo | Status | Observação |
|---|---|---|
| Seção Usuário — Lista de todos os usuários com Role | ❌ | Página existe mas está **completamente vazia/stub** |
| Seção Permissões — Lista de recursos do sistema por role | ❌ | Não implementado |
| Ativar/Desativar recurso por usuário específico | ❌ | Não implementado |
| Ativar/Desativar recurso por grupo (ex: todos mensalistas) | ❌ | Não implementado |

---

## 2. VISÃO MÉDICO

### 2.1 Dashboard Médico (`/medico/dashboard`)

| Item do Escopo | Status | Observação |
|---|---|---|
| Layout horizontal — Esquerda 60% / Direita 40% | ⚠️ | Existe mas verificar proporções reais no CSS |
| Card Grande — Próximas reservas (próximos 7 dias, futuras) | ✅ | Implementado |
| Para cada reserva — lista de consultas agendadas | ✅ | Implementado |
| Ação Consulta — Cancelar/Remarcar | ✅ | Implementado |
| Ação Consulta — Ver Detalhes | ✅ | Implementado |
| Ação Reserva — Editar/Cancelar reserva | ✅ | Implementado |
| Ação Reserva — Agendar nova consulta | ✅ | Implementado |
| Estado vazio Consultas — "Nenhuma consulta agendada..." + botão Agendar | ✅ | Implementado |
| Estado vazio Reservas — "Nenhuma reserva agendada..." + botão Reservar | ✅ | Implementado |
| Tabela: Histórico Recente (últimas 10 consultas) | ✅ | Implementado |
| Card: Suas Informações (nome, especialidade, telefone, email) | ✅ | Implementado |
| Card: Tipo de Acesso — Mensalista com horários fixos | ⚠️ | Exibe info, mas sem edição direta da grade de horários fixos |
| Card: Tipo de Acesso — Avulso "Livre para reservar" | ✅ | Implementado |
| Ação Mensalista — Editar/Cancelar um dia específico | ❌ | Não implementado |
| Ação Mensalista — Editar/Cancelar todos os dias | ❌ | Não implementado |
| Ação Mensalista — Reservar mais horários | ❌ | Não implementado com contexto de horários fixos |
| Quick Actions — "Minhas Reservas" (leva à aba calendário) | ✅ | Implementado |
| Quick Actions — "Reservar Sala Agora" (leva a reservas) | ✅ | Implementado |
| Quick Actions — "Registrar Pacientes" (abre modal) | ✅ | Implementado |

---

### 2.2 Reservas Sala (`/medico/reservas`)

| Item do Escopo | Status | Observação |
|---|---|---|
| Header — Filtro por período (dia/semana/mês) | ⚠️ | Existe mas verificar funcionalidade completa |
| Header — Botão "+ Reserva" (abre modal) | ✅ | Implementado |
| Lista de todas as próximas reservas | ✅ | Implementado |
| Histórico de reservas | ⚠️ | Existe mas pode estar incompleto |
| Modal Reserva — Selecionar data e hora (obrigatório) | ✅ | Implementado |
| Modal Reserva — Selecionar sala (opcional) | ✅ | Implementado |
| Modal Reserva — Apenas horários disponíveis | ⚠️ | Lógica em `businessRules.ts` existe, verificar cobertura completa |
| Modal Reserva — Duração mínima de 1 hora | ⚠️ | Regra existe no escopo, verificar validação no modal |
| Modal Reserva — Calendário visual com datas/horas indisponíveis desabilitadas | ⚠️ | Existe, mas cobertura de bloqueios recorrentes complexos não garantida |
| Modal Reserva — Slider ou input numérico para duração | ⚠️ | Verificar se implementado |
| Modal Reserva — Hora fim calculada automaticamente | ⚠️ | Verificar implementação |
| Modal Reserva — Agendar mais de um horário não contínuo por vez | ❌ | Não implementado |
| Modal Reserva — Confirmação com resumo do agendamento | ⚠️ | Existe display de confirmação, verificar se tem resumo completo |
| Modal Reserva — Animação ao confirmar reserva | ❌ | Não implementado |
| Após confirmar — Display "Registre seus agendamentos" com opção "registrar" ou "registrar depois" | ⚠️ | Fluxo existe parcialmente, verificar completude |
| "Registrar" → Modal de novo agendamento com horários já reservados | ⚠️ | Modal existe, verificar se filtra apenas horários reservados |
| Se selecionar horário não reservado → opção de reagendar reserva ou criar nova | ❌ | Não implementado |
| Dados da consulta — Nome do paciente | ✅ | Implementado |
| Dados da consulta — Telefone do paciente | ✅ | Implementado |
| Autocomplete se paciente já cadastrado | ❌ | Não implementado |
| Cards para cada paciente (fácil remoção) | ✅ | Implementado |
| Validação de telefone em tempo real | ⚠️ | `validators.ts` existe, verificar se aplicado no modal |
| Botão "+ Registrar" só funciona se campos anteriores preenchidos | ⚠️ | Validação com Zod existe, verificar aplicação |

---

### 2.3 Calendário Médico (`/medico/calendario`)

| Item do Escopo | Status | Observação |
|---|---|---|
| Filtro por período (dia/semana/mês) | ✅ | Implementado |
| Filtro por paciente (nome/telefone) | ❌ | Não implementado |
| Botão "+ Reserva" (modal de novo período de sala) | ✅ | Implementado |
| Botão "+ Consulta" (modal de agendar novo paciente) | ✅ | Implementado |
| Vista Google Calendar — destacar horários reservados de salas | ✅ | Implementado |
| Cada bloco com período de cada consulta agendada | ⚠️ | Existe, verificar granularidade |
| Click no bloco → Modal com informações e ações | ✅ | Implementado |
| Ação no bloco de Reserva — Agendar nova consulta | ✅ | Implementado |
| Ação no bloco de Reserva — Remarcar/Cancelar/Editar | ✅ | Implementado |
| Ação no bloco de Agendamento — Remarcar/Cancelar/Editar | ✅ | Implementado |
| Visualização em Lista (alternativa ao calendário) | ✅ | `MedicoListView.tsx` implementado |
| Vista Lista — Horários reservados com consultas agendadas | ⚠️ | Implementado, verificar completude |
| Vista Lista — Horários reservados sem consultas: destaque + botão "Agendar Consulta" | ⚠️ | Verificar se o destaque e botão rápido funcionam |
| Status nas consultas — tags Confirmado / Pendente / Realizado | ⚠️ | Schema tem os status, verificar se UI exibe e permite editar as tags |

---

### 2.4 Pacientes (`/medico/pacientes`)

| Item do Escopo | Status | Observação |
|---|---|---|
| Registro em cards de todos os pacientes | ✅ | Implementado |
| Ao clicar no card — exibir todas as informações | ⚠️ | Existe, verificar se exibe campos customizáveis |
| Campo obrigatório — Nome | ✅ | Implementado |
| Campo obrigatório — Telefone | ✅ | Implementado |
| Campo padrão — Data de Nascimento | ✅ | No schema |
| Campo padrão — CPF | ✅ | No schema |
| Campo padrão — Email | ✅ | No schema |
| Campo padrão — Endereço | ✅ | No schema |
| Campo customizável — Anamnese | ✅ | No schema |
| Campo customizável — Medicações | ✅ | No schema |
| Campo customizável — Notas Internas | ✅ | No schema |
| Configuração de campos customizáveis por médico (nas Configurações) | ❌ | Não implementado — campos fixos no schema sem personalização por médico |
| Registrar retorno / histórico do paciente / remédios contínuos | ❌ | Campos existem mas sem fluxo dedicado de acompanhamento |

---

## 3. REGRAS DE NEGÓCIO — STATUS

| Regra | Status | Observação |
|---|---|---|
| Reserva = reservar sala; Agendamento = agendar consulta do paciente | ✅ | Terminologia consistente no código |
| Horário contínuo mínimo de 1h para reserva de sala | ⚠️ | Regra documentada, verificar se validada em todos os fluxos de criação |
| Cada reserva deve conter agendamentos com nome e telefone do paciente | ⚠️ | Reserva pode ser criada vazia (permitido pelo escopo), mas fluxo de adicionar depois precisa ser verificado |
| Reserva pode ser criada vazia e agendamentos adicionados depois | ✅ | Suportado pelo schema |
| Médico mensalista: horários fixos pré-reservados com preferência | ❌ | Lógica de horários fixos automáticos não está implementada; campo `horarios_fixos` existe como JSON mas sem engine de criação automática de reservas |
| Médico ou clínica pode editar/cancelar horários sem conflito | ⚠️ | Lógica de conflito existe (`businessRules.ts`), mas cobertura para mensalistas não verificada |
| Médico só vê seus próprios pacientes e reservas/agendamentos | ✅ | Regras de API no PocketBase implementadas |
| Cada sala tem sua própria agenda — nunca duas reservas no mesmo horário/sala | ⚠️ | `checkConflict()` existe, mas cobertura de edge cases de bloqueios recorrentes não garantida |
| Nunca pode haver agendamento sem reserva | ✅ | `reserva_id` é obrigatório no schema de agendamentos |
| Cada agendamento precisa de duração da consulta | ⚠️ | `hora_inicio` e `hora_fim` existem, verificar validação de preenchimento obrigatório |
| Soma de consultas não pode exceder duração da reserva → aviso para aumentar reserva | ❌ | **Não implementado** — regra de negócio crítica ausente |
| Se exceder e horário disponível: opção de aumentar reserva | ❌ | Não implementado |
| Se exceder e sem horário: opção de criar nova reserva | ❌ | Não implementado |
| Bloqueio Pontual (data + hora) | ✅ | Implementado |
| Bloqueio Diário (cada dia X) | ✅ | Implementado |
| Bloqueio Semanal (cada semana no dia X) | ✅ | Implementado |
| Bloqueio Mensal (dia X de cada mês) | ✅ | Implementado |
| Bloqueio Período (data A até data B) | ✅ | Implementado |
| Bloqueio Recorrência Complexa ("2º domingo de cada mês") | ❌ | Schema tem o tipo mas sem lógica de avaliação implementada |
| Campos paciente — Obrigatórios visíveis para médico e clínica: Nome, Telefone | ✅ | Implementado |
| Campos paciente — Padrão visíveis para médico e clínica: Nasc, CPF, Email, Endereço | ✅ | No schema |
| Campos paciente — Customizáveis: Anamnese, Medicações, Notas | ✅ | No schema |
| Cada médico tem sua própria lista de pacientes — nunca misturar | ✅ | Regras de API implementadas |
| Clínica vê todos os pacientes | ✅ | Regras de API implementadas |
| Remarcar = muda data/hora (mesma ou nova reserva) | ⚠️ | Existe, mas "nova reserva" no remarcamento não está claro |
| Editar = altera dados do paciente ou duração da consulta | ✅ | Implementado |
| Cancelar = remove agendamento | ✅ | Implementado |

---

## 4. SIDEBAR E NAVEGAÇÃO

| Item do Escopo | Status | Observação |
|---|---|---|
| Logo + Nome da Clínica (topo, 80px) | ⚠️ | Existe, verificar se altura é 80px exata |
| Avatar do Usuário com nome e tipo de acesso | ✅ | Implementado |
| Menu Principal com ícones + texto | ✅ | Implementado |
| Item: Dashboard | ✅ | Implementado |
| Item: Médicos | ✅ | Implementado (apenas visão clínica) |
| Item: Salas | ✅ | Implementado (apenas visão clínica) |
| Item: Agenda | ✅ | Implementado (apenas visão clínica) |
| Seção de Contexto (dropdown se médico mensalista) | ❌ | Não implementado — escopo prevê dropdown contextual para mensalista |
| Logout (rodapé) | ✅ | Implementado |
| Cores `#f7e6dc` e `#05807f` nos elementos | ⚠️ | Parcialmente — verificar consistência com o design system |

---

## 5. DESIGN SYSTEM E UI/UX

| Item do Escopo | Status | Observação |
|---|---|---|
| Fontes: Manrope (headings) + Inter (body) | ✅ | Configurado no Tailwind e carregado via Google Fonts |
| Paleta de cores primária `#006564` / `#05807f` | ✅ | Configurado |
| `secondary-container` `#f0dfd5` | ✅ | Configurado |
| Sistema de raios de borda (DEFAULT 0.25rem, lg 0.5rem, xl 0.75rem) | ✅ | Configurado |
| Spacing system (xs, sm, md, lg, xl, gutter, sidebar-width) | ✅ | Configurado |
| Cards com degradê `#f7e6dc → #05807f` | ⚠️ | Existe em alguns cards, não padronizado |
| Badges mensalista: fundo `#f7e6dc`, texto `#05807f` | ✅ | Implementado |
| Tooltips ao passar sobre gráficos | ✅ | Recharts tooltips |
| Filtros como chips selecionáveis | ⚠️ | Alguns como chips, outros como selects |
| Animação ao confirmar reserva | ❌ | Não implementado |
| Modal com display de resumo antes de confirmar reserva | ⚠️ | Existe, verificar completude |
| Dark mode | ⚠️ | `next-themes` integrado, mas não previsto no escopo — possível feature não solicitada |

---

## 6. INCONSISTÊNCIAS E DIVERGÊNCIAS

### 6.1 Bug crítico — Serviço de Médicos
**Arquivo:** `src/services/medicos.ts` vs `src/pages/medicos/MedicosList.tsx`  
`getMedicos()` é definido sem parâmetros, mas chamado com `(page, debouncedSearch)`. Causa erro em runtime na listagem de médicos.

### 6.2 Dados mockados no Dashboard
**Arquivo:** `src/pages/Index.tsx`, `src/components/dashboard/mock-data.ts`  
Todo o dashboard da clínica usa dados falsos. Os KPIs, gráficos e tabela de agendamentos não refletem o banco de dados real do PocketBase.

### 6.3 Taxa de Ocupação de Salas é falsa
**Arquivo:** `src/pages/salas/SalasList.tsx`  
A função `mockOcupacao()` retorna valores aleatórios. A taxa real deveria ser calculada com base nas reservas do mês (`reservas` collection).

### 6.4 "Próximo uso" da sala é falso
**Arquivo:** `src/pages/salas/SalasList.tsx`  
O próximo uso das salas exibido nos cards não vem do banco — é gerado por `Math.random()`.

### 6.5 Horários fixos de mensalistas sem engine
**Arquivo:** `src/lib/pocketbase/schema.json` (campo `horarios_fixos`)  
O campo existe como JSON no banco mas não há lógica que:
- Converta os horários fixos em reservas reais ao início de cada mês
- Exiba a grade de horários fixos no modal de edição
- Permita editar/cancelar um dia específico vs. todos os dias

### 6.6 Bloqueio de Recorrência Complexa sem lógica
O tipo `recorrencia_complexa` está no schema do banco e no enum do front, mas não existe função que avalie se uma data se encaixa nesse padrão ("2º domingo de cada mês").

### 6.7 Regra de negócio crítica ausente — Soma de consultas
O escopo define explicitamente (regra 11): "A soma de consultas não pode exceder a duração da reserva". Não existe nenhuma validação desse tipo no código.

### 6.8 Configurações completamente vazia
`/configuracoes` existe como rota mas o componente não tem implementação — é uma página em branco. O escopo prevê controle de permissões por usuário e por grupo.

### 6.9 Autocomplete de paciente não implementado
O escopo define: "Se o cliente já tiver sido registrado, apenas autocomplete, se não, registre." O modal de agendamento não tem autocomplete — cria sempre um novo registro de paciente.

### 6.10 Agendar múltiplos horários não contínuos por vez
O escopo prevê reservar mais de um horário não contínuo em uma única operação. O modal atual permite apenas uma reserva por vez.

### 6.11 Campos customizáveis de paciente sem personalização
O escopo define que "em configuração, o médico pode personalizar os campos que vai registrar". Os campos são fixos no schema sem nenhum mecanismo de personalização por médico.

### 6.12 Seção de Contexto da Sidebar para mensalistas
O escopo prevê um "dropdown de contexto" na sidebar quando o usuário é médico mensalista. Não foi implementado.

### 6.13 Visão em Lista para Agenda Clínica
O escopo prevê a Agenda Geral com "visão em forma de calendário" OU "visão em forma de lista". Apenas o calendário foi implementado na visão clínica (a visão médica tem lista).

### 6.14 Filtro por paciente no Calendário Médico
O escopo prevê filtro por "paciente nome/telefone" no header do calendário médico. Não implementado.

### 6.15 Período personalizado na navegação da Agenda
O escopo prevê "Semana, mês, período personalizado" na navegação. Período personalizado com seleção livre de datas não está implementado.

### 6.16 Clique em espaço livre da Agenda da Sala
Na seção de Salas, o escopo define: "Clique em espaço livre → Modal para agendar manualmente". O `AgendaSala.tsx` não implementa esse comportamento.

---

## 7. ITENS TÉCNICOS FALTANDO

| Item | Prioridade | Observação |
|---|---|---|
| Conectar Dashboard a dados reais do PocketBase | Alta | Todo KPI e gráfico usa mock |
| Corrigir assinatura de `getMedicos()` com busca e paginação | Alta | Bug causa erro em runtime |
| Engine de horários fixos para mensalistas | Alta | Regra de negócio core |
| Validação: soma de consultas ≤ duração da reserva | Alta | Regra de negócio core |
| Taxa de ocupação real calculada por sala | Alta | Dados falsos exibidos |
| Próximo uso real calculado por sala | Alta | Dados falsos exibidos |
| Autocomplete de paciente no modal de agendamento | Alta | Previsto no escopo |
| Implementar Configurações (permissões e acesso) | Alta | Página completamente vazia |
| Lógica de avaliação de bloqueio `recorrencia_complexa` | Média | Tipo existe mas sem engine |
| Modal de grade de horários fixos no cadastro de médico mensalista | Média | Campo existe no banco sem UI |
| Editar/cancelar dia específico vs todos para mensalista | Média | Regra de negócio |
| Agendamentos múltiplos não contínuos por vez | Média | Previsto no escopo |
| Animação ao confirmar reserva | Baixa | UX visual |
| Filtro por paciente no calendário médico | Média | Previsto no escopo |
| Período personalizado na navegação da agenda | Baixa | Conforto de uso |
| Clique em espaço livre na Agenda da Sala | Média | UX prevista no escopo |
| Visualização em Lista na Agenda Clínica | Baixa | Alternativa de visualização |
| Dropdown de contexto na sidebar para mensalistas | Baixa | UX de navegação |
| Subpágina Detalhes do Médico completa (histórico, estatísticas) | Alta | Totalmente ausente |
| Campos customizáveis de paciente por médico | Baixa | Feature avançada |
| Alterar senha e email do médico na edição | Média | Previsto no escopo |
| Testes automatizados | Baixa | Inexistentes (0% cobertura) |

---

## 8. RESUMO EXECUTIVO

| Categoria | Implementado | Parcial | Ausente |
|---|---|---|---|
| Autenticação e Roles | ✅ | — | — |
| Dashboard Clínica | — | ⚠️ (dados mock) | — |
| Médicos — Listagem | ⚠️ (bug runtime) | — | — |
| Médicos — Detalhes | — | — | ❌ |
| Salas — Cards e modais | ✅ | ⚠️ (dados mock) | — |
| Agenda Clínica | ✅ | ⚠️ (sem lista) | — |
| Gestão de Reservas | ✅ | — | — |
| Configurações | — | — | ❌ |
| Dashboard Médico | ✅ | ⚠️ (mensalista) | — |
| Reservas Sala (médico) | — | ⚠️ | — |
| Calendário Médico | ✅ | ⚠️ | — |
| Pacientes (médico) | ✅ | ⚠️ (sem custom) | — |
| Regras de Negócio Críticas | — | ⚠️ | ❌ (soma consultas, mensalistas) |
| Design System | ✅ | ⚠️ (não uniforme) | — |

**Estimativa:** O sistema tem ~65% das funcionalidades do escopo implementadas, com os 35% restantes concentrados principalmente em: dados reais no dashboard, engine de mensalistas, validação de soma de consultas, página de configurações, e subpágina de detalhes do médico.
