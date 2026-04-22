1. Objetivo: Um sistema de controle de reservas de salas de coworking de uma clínica médica. Esse sistema será responsável por facilitar a comunicação entre o médico e a clínica na reserva de salas de atendimento. A clínica possui algumas salas disponíveis para serem reservadas por médicos, que podem ser tanto mensalistas quanto avulsos. O médico deve reservar a sala e agendar pacientes nos horários disponíveis para reserva.
2. Design:
   1. Sidebar de Navegação (Persistente)
      1. Elementos:
         1. Logo \+ Nome da Clínica (topo, altura 80px)
         2. Avatar do Usuário com nome e tipo de acesso (Médico/Clinica)
         3. Menu Principal com ícones \+ texto
            1. Dashboard
            2. Médicos
            3. Salas
            4. Agenda
         4. Seção de Contexto (dropdown se médico mensalista)
         5. Logout (rodapé)
      2. Cores: Cores do sistema, use para elementos e detalhes \#f7e6dc, \#05807f

3. Usuários: O sistema terá dois usuários com uma visão diferente, e serão: Visão clínica e visão médica.
   1. Visão Clínica:
      1. Páginas:
         1. Dashboard Clínica
            1. Layout Principal:
               1. Grid de Cards KPI (4 colunas em desktop):
                  1. 📊 Taxa Ocupação Geral (%)
                  2. 👨‍⚕️ Médicos Ativos
                  3. 🏥 Salas Disponíveis Agora
                  4. 📅 Agendamentos Próximos 7 Dias (futuras)
               2. Seção de Gráficos (2 colunas):
                  1. Esquerda: Gráfico de linha — Ocupação por dia do mês
                  2. Direita: Gráfico de pizza — Distribuição por sala
               3. Tabela: Próximos Agendamentos (últimas 24h e próximas 48h) com o nome, telefone, hora do atendimento, médico, e sala
            2. Componentes:
               1. Cards com números grandes, cores em degradê (\#f7e6dc → \#05807f)
               2. Filtros como chips selecionáveis, dia, mes, semana, Sala (Checkboxes \- Sala 1, Sala 2, Sala 3), Médico (Checkboxes, multiselect, tipo \- avulso mensalista), Ocupação (Slider \- 0% a 100%)
               3. Tooltips ao passar sobre gráficos
      2. Médicos:
         1. Seção Superior: Busca \+ Filtros
            1. Campo de busca (nome, email, especialidade)
            2. Botão: \+ Novo Médico
         2. Tabela de Médicos:
            1. Lista de todos os médicos cadastrados
            2. Destaque visual para mensalistas (badge "\#f7e6dc" com texto "\#05807f")
         3. Subpagina: Detalhes do Médico
            1. Seção: Histórico de Reservas (tabela com scroll horizontal)
            2. Seção: Próximos Horários reservados com a sala referenciada (se mensalista, mostrar grade fixa)
            3. Seção: Em cada horário reservado, mostrar agendamento de todos os pacientes.
            4. Seção: Reservas \- Card com o número de quantas consultas fez no mês/número de pacientes atendidos, e quantas horas foram agendadas no mês, podendo filtrar para outros meses/periodos
         4. Modal: Editar/Cadastro Médico
            1. Toggle: Mensalista / Avulso
            2. Se Mensalista: Grid para marcar horários fixos com opção de editar (seg-sex, 9h-19h)
            3. Botão: Salvar | Cancelar
         5. Regras:
            1. Todo médico cadastrado no modal deve ter o campo para colocar email e senha, e com essas informações cria-se um usuário para acessar o sistema com role médico. Em editar um médico criado, pode alterar senha e email, além das outras informações
      3. Salas
         1. Seção Superior: Filtros
         2. Cards de Salas (grid 1-3 colunas conforme tamanho):
            1. O card deve mostrar as seguintes informações:
               1. Nome da sala
               2. Status \- Ativa, Inativa
               3. Próximo uso (ex: 14h30 \- se for no dia, deixar apenas o horário; Dia 25.04 \- Se for em outro dia, deixar só a data)
               4. Taxa de ocupação do mês
               5. Editar e bloquear (bloquear todos os horários, ou em um momento específico personalizável \- dia, hora, semana, etc)
         3. Modal: Configurar Sala
            1. Horário de Funcionamento:
               1. Início: \[09:00\] | Fim: \[19:00\]
               2. Toggle para cada dia da semana
            2. Bloqueios Específicos:
               1. Botão: \+ Adicionar Bloqueio \- de horário ou dia específico, ou que se repete todas semanas/mês/dia
         4. Modal: Adicionar Sala
            1. Nome da Sala
            2. Horário de funcionamento
         5. Agenda Visual da Sala (expandir ao clicar em uma sala):
            1. Vista estilo Google Calendar (semana/mês/dia)
            2. Mostra reservas ocupadas (\#05807f semi-transparente)
            3. Espaços livres em branco
            4. Clique em espaço livre → Modal para agendar manualmente
      4. Agenda Geral (Google Calendar Style): Visão em forma de calendários ou em forma de lista
         1. Header:
            1. Navegação: \< Hoje \> ou Semana, mês, período personalizado
            2. Filtro: Médico ou sala
            3. Botão: \+ Reservar Manualmente
         2. Visualização por Dia:
            1. Eixo vertical: Horários (09:00 \- 19:00)
            2. Blocos de agendamento com:
               1. Nome do Médico (negrito, \#05807f)
               2. Paciente(s) (nome e telefone)
               3. Hora (09:00 \- 10:00)
               4. Sala (canto superior direito do bloco)
         3. Hover sobre bloco: Mostrar tooltip com todos os pacientes (nome \+ telefone)
         4. Click no bloco: Modal com:
            1. Detalhes da reserva
            2. Lista de pacientes (nome, telefone)
         5. Visualização por Semana/Mês:
            1. Cards de agendamentos empilhados
            2. Cores diferenciam médicos ou status
         6. Modal: Agendar Manualmente Reserva
            1. Seletor de Médico (autocomplete)
            2. Seletor de Data
            3. Seletor de Sala (apenas salas livres naquele horário)
            4. Seletor de Hora (com blocos de no mínimo 1h)
            5. Botões: Salvar | Cancelar
      5. Gestão:
         1. Lista com filtros de todos as reservas realizadas
      6. Configurações:
         1. Permissões e Acesso
            1. Seção Usuário: Lista de todos os usuários do sistema com a Role
            2. Seção Permissões: Lista de todas os recurso do sistema para cada role, com a possibilidade de ativar ou desativar recurso para usuários especificos ou para grupo de usuários (ex: todos os mensalistas)
   2. Visão Médico:
      1. Dashboard Médico
         1. Layout Horizontal (2 seções lado a lado):
            1. Esquerda (60% largura):
               1. Card Grande: Próximas reservas, e para cada reserva a lista de Consultas agendadas (próximos 7 dias \- futuras)
                  1. Ação:
                     1. Consultas agendadas: Cancelar/Remarcar | Ver Detalhes
                     2. Reservas sala: Editar/cancelar reserva; Agendar nova consulta
                     3. Se nenhuma:
                        1. Consultas agendadas (caso tenha horários já reservados, se não tiver, não aparece): "Nenhuma consulta agendada nos próximos 7 dias" \- botão ação rápida: Agendar
                        2. Reservas sala: “Nenhuma reserva agendada nos próximos 7 dias” \- botão ação rápida: Reservar
               2. Tabela: Histórico Recente (últimas 10 consultas)

            2. Direita (40% largura):
               1. Card: Suas Informações
               2. Card: Tipo de Acesso
                  1. Mensalista: "Horários fixos pré agendados: ex Seg/Qua/Sex 09:00-12:00 e 14:00-18:00"
                     1. Ação:
                        1. Editar/cancelar \- Um dia específico, ou todos os dias.
                        2. Reservar mais horários
                  2. Avulso: "Livre para reservar"
            3. Quick Action Buttons (botões grandes):
               1. Minhas Reservas (leva para aba calendário)
               2. Reservar Sala Agora (leva para aba reservas sala)
               3. Registrar Pacientes (abre modal)

      2. Reservas Sala
         1. Header:
            1. Filtro Por período \- dia/semana/mês;
            2. Botão \+Reserva \- abre modal
         2. Reservas:
            1. Lista de todas as próximas reservas
            2. Histórico de reservas
         3. Modal reserva
            1. Selecionar a preferência de data, hora \- obrigatório, sala \- opcional.
            2. Só aparecer horários disponíveis para ser agendados
            3. O médico Escolhe o horário, data e sala com o horário disponível
            4. Duração mínima de 1 hora
            5. Seletor de data com calendário visual (desabilita datas/horas indisponíveis)
            6. Slider ou input numérico para duração
            7. Hora fim calcula automaticamente o mínimo do agendamento
            8. Pode agendar mais de um horário não continuo por vez
            9. Botão de confirmar reserva, abre um display, com o resumo do agendamento e o botão confirmar.
            10. Animação ao confirmar reserva
            11. Abre um Display com registre seus agendamentos de consultas com pacientes, com a opção "registrar” ou "registrar depois”
                1. Registrar, abre o modal de novo agendamento:
                   1. Escolher o dia/horário, duração da consulta, deixar disponível apenas os horários já reservados, se selecionar outro horário, aparecer a opção para reagendar uma reserva, ou criar uma nova reserva
                   2. Escolhendo um horário reservado disponível, vai que acrescentar os Dados da consulta agendada do paciente, podendo agendar 1 ou mais consultas por vez, desde que preencha apenas os horários reservados :
                      1. Nome
                      2. telefone
                      3. Se o cliente já tiver sido registrado, apenas autocomplete, se não, registre.
                   3. Cards para cada paciente (fácil removê-los)
                   4. Validação de telefone em tempo real
                   5. Botão "+ Registrar" só funciona se campos anteriores preenchidos
      3. Calendário
         1. Header:
            1. Filtros: Por período \- dia/semana/mês; Por paciente nome/telefone;
            2. Botão
               1. \+ Reserva: Modal de reservar novo período de sala para atendimento.
               2. \+ Consulta: Modal de agendar novo paciente
         2. Calendário: Terá duas opções de visualização:
            1. Google Calendar style, com visão em forma de calendário:
               1. Destacar apenas os horários reservados de salas, com o período de cada consulta agendada
               2. Click no bloco → Modal com as informações do agendamento/reserva com algumas ações:
                  1. Ação:
                     1. Reserva: opção de agendar nova consulta, e remarcar/cancelar/editar a reserva
                     2. Agendamento: opção de remarcar/cancelar/editar
            2. Lista \- com visão em forma de lista:
               1. Listar os horários reservados, preenchidos com os horários com consultas agendadas, e os horários reservados sem consultas agendas destacar com cores e um botão de ação rápida de agendar consulta, que abre o modal.
         3. Regras:
            1. Mostrar apenas reservas/agendamentos do próprio médico
            2. Status: Lista de consultas agendadas com a opção de tags com Confirmado, Pendente ou realizado
      4. Pacientes:
         1. Registro em cards de todos os pacientes
         2. Ao clicar em um card, abre todas as informações registradas (as obrigatórias são: nome e telefone \- informações que a clínica precisa para recepcionar o paciente).
            1. Em configuração, pode personalizar os campos que o médico vai registrar as informações adicionais (nome e telefone não são personalizados, pois apenas essas informações terão relacionamento com a visão da clínica), para acompanhamento dos pacientes, como anamnese, agendar retorno, registrar histórico do paciente, remédios contínuos, etc

4. Regras Gerais:
   1. Reserva/agendamento:
      1. Reserva: Se refere a reservar a sala
      2. Agendamento: Se refere a agendar consultas de pacientes nos horários reservados
   2. Os horários de para reserva de sala de forma contínua são no mínimo de 1h
   3. Cada reserva deve conter os agendamentos de consultas dos pacientes que serão atendidos naquela reserva com os dados obrigatórios: nome e telefone do paciente.
   4. A Reserva pode ser criada vazia, mas agendamentos podem ser adicionados depois.
   5. Os médicos mensalistas têm horários fixos, que são pré reservados e possuem a preferência para aquele horário no mês, porém o médico ou a clínica pode editar/cancelar, todos os horários ou um específico desde que não haja conflito de horários já reservados por médicos, tanto outros mensalistas ou avulsos.
   6. Um médico só pode ver informações dos próprios pacientes, e próprias reservas/agendamentos
   7. Cada sala tem a sua própria agenda disponível para reserva. Nunca pode haver duas reservas para o mesmo horário para a mesma sala. Um médico quando vai reservar a sala, só aparecerá horários disponíveis, evitando conflito de horários.
   8. Nunca pode haver um agendamento sem que haja uma reserva.
   9. Para cada novo agendamento é preciso colocar o horário de duração da consulta.
   10. Como o médico tem a opção de reservar sala e Agendar uma consulta, deixe visual e intuitivo essa diferença entre a reserva da sala e registro de pacientes daquele horário
   11. A soma de consultas não pode exceder a duração da reserva, se exceder, deve haver um aviso para aumentar o tempo da reserva se disponível o horário, ou criar uma nova reserva.
   12. Tipos de bloqueios:
       1. Pontual: Data \+ Hora específica
       2. Diário: Cada dia X (seg/qua/sex)
       3. Semanal: Cada semana no dia X
       4. Mensal: Dia X de cada mês
       5. Período: De data A até data B (customizado)
       6. Recorrência Complexa: "2º domingo de cada mês"
   13. Campos informações pacientes:
       1. Campos Obrigatórios (visíveis para médico e clínica): Nome, Telefone
       2. Campos Padrão (visíveis para médico e clínica): Data Nascimento, CPF, Email, Endereço
       3. Campos Customizáveis (visíveis para médico e clínica): Anamnese, Medicações, Notas Internas
       4. Cada médico tem o sua própria lista de pacientes, nunca podendo um médico ver os pacientes de outro médico, em nenhuma hipotese, apenas a clínica vê todos os pacientes
   14. Editar agendamento:
       1. Remarcar: Muda data/hora da consulta (na mesma reserva ou em nova reserva)
       2. Editar: Altera dados do paciente (nome, telefone) ou duração da consulta
       3. Cancelar: Remove agendamento

5. Design Systems e componentes UI/UX
   1. Use esse codigo em html para entender todos os componentes e o design systems  
      \<\!DOCTYPE html\>
      \<html class="light" lang="en"\>\<head\>  
      \<meta charset="utf-8"/\>  
      \<meta content="width=device-width, initial-scale=1.0" name="viewport"/\>  
      \<title\>ClinicPro Modern Design System\</title\>  
      \<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"\>\</script\>  
      \<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800\&amp;family=Inter:wght@400;500;600;700\&amp;display=swap" rel="stylesheet"/\>  
      \<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1\&amp;display=swap" rel="stylesheet"/\>  
      \<script id="tailwind-config"\>  
       tailwind.config \= {  
       darkMode: "class",  
       theme: {  
       extend: {  
       "colors": {  
       "tertiary-container": "\#687386",  
       "secondary-container": "\#f0dfd5",  
       "on-surface": "\#191c1e",  
       "inverse-on-surface": "\#eff1f3",  
       "on-surface-variant": "\#3e4948",  
       "on-primary-fixed-variant": "\#00504f",  
       "surface-container-lowest": "\#ffffff",  
       "on-secondary": "\#ffffff",  
       "on-tertiary": "\#ffffff",  
       "tertiary-fixed": "\#d8e3f9",  
       "surface-variant": "\#e0e3e5",  
       "secondary-fixed": "\#f0dfd5",  
       "on-primary-container": "\#e3fffe",  
       "surface-dim": "\#d8dadc",  
       "on-tertiary-container": "\#f8f9ff",  
       "surface-container": "\#eceef0",  
       "surface-tint": "\#006a69",  
       "outline": "\#6e7979",  
       "on-tertiary-fixed-variant": "\#3c4759",  
       "secondary": "\#685c54",  
       "on-primary": "\#ffffff",  
       "surface": "\#f7f9fb",  
       "on-secondary-fixed-variant": "\#50453d",  
       "surface-container-low": "\#f2f4f6",  
       "background": "\#f7f9fb",  
       "on-primary-fixed": "\#002020",  
       "tertiary": "\#505b6d",  
       "on-secondary-fixed": "\#221a14",  
       "on-background": "\#191c1e",  
       "surface-container-highest": "\#e0e3e5",  
       "surface-bright": "\#f7f9fb",  
       "on-error": "\#ffffff",  
       "on-tertiary-fixed": "\#111c2c",  
       "primary-fixed-dim": "\#77d6d4",  
       "tertiary-fixed-dim": "\#bcc7dc",  
       "secondary-fixed-dim": "\#d3c3ba",  
       "inverse-primary": "\#77d6d4",  
       "on-secondary-container": "\#6e625a",  
       "inverse-surface": "\#2d3133",  
       "error": "\#ba1a1a",  
       "outline-variant": "\#bdc9c8",  
       "error-container": "\#ffdad6",  
       "surface-container-high": "\#e6e8ea",  
       "primary-container": "\#05807f",  
       "on-error-container": "\#93000a",  
       "primary-fixed": "\#94f2f0",  
       "primary": "\#006564"  
       },  
       "borderRadius": {  
       "DEFAULT": "0.25rem",  
       "lg": "0.5rem",  
       "xl": "0.75rem",  
       "full": "9999px"  
       },  
       "spacing": {  
       "xs": "4px",  
       "xl": "40px",  
       "sidebar-width": "256px",  
       "lg": "24px",  
       "gutter": "24px",  
       "container-max": "1440px",  
       "md": "16px",  
       "sm": "8px"  
       },  
       "fontFamily": {  
       "h3": \["Manrope"\],  
       "h2": \["Manrope"\],  
       "body-lg": \["Inter"\],  
       "label-bold": \["Inter"\],  
       "body-sm": \["Inter"\],  
       "body-md": \["Inter"\],  
       "h1": \["Manrope"\]  
       },  
       "fontSize": {  
       "h3": \["20px", { "lineHeight": "1.4", "fontWeight": "600" }\],  
       "h2": \["24px", { "lineHeight": "1.3", "fontWeight": "600" }\],  
       "body-lg": \["16px", { "lineHeight": "1.6", "fontWeight": "400" }\],  
       "label-bold": \["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }\],  
       "body-sm": \["12px", { "lineHeight": "1.5", "fontWeight": "400" }\],  
       "body-md": \["14px", { "lineHeight": "1.5", "fontWeight": "400" }\],  
       "h1": \["32px", { "lineHeight": "1.2", "fontWeight": "700" }\]  
       }  
       }  
       }  
       }  
       \</script\>  
      \<style\>  
       .material-symbols-outlined {  
       font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;  
       }  
       \</style\>  
      \</head\>  
      \<body class="bg-background text-on-background font-body-md min-h-screen flex flex-col"\>  
      \<\!-- Main Content Canvas \--\>  
      \<main class="flex-1 min-h-screen w-full"\>  
      \<\!-- Page Content \--\>  
      \<div class="max-w-\[1440px\] mx-auto p-xl"\>  
      \<div class="mb-xl"\>  
      \<h1 class="font-h1 text-on-surface mb-2"\>ClinicPro Modern Design System\</h1\>  
      \<p class="font-body-lg text-on-surface-variant max-w-2xl"\>The authoritative source of truth for the ClinicPro visual identity, balancing clinical efficiency with a calming, patient-first aesthetic.\</p\>  
      \</div\>  
      \<div class="grid grid-cols-1 lg:grid-cols-12 gap-xl"\>  
      \<\!-- Left Column (Wider) \--\>  
      \<div class="lg:col-span-8 flex flex-col gap-xl"\>  
      \<\!-- Colors Section \--\>  
      \<section class="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-\[0_2px_4px_rgba(5,128,127,0.04)\]"\>  
      \<h2 class="font-h2 text-on-surface mb-lg flex items-center gap-2"\>  
      \<span class="material-symbols-outlined text-primary"\>palette\</span\>  
       Color Palette  
       \</h2\>  
      \<div class="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg"\>  
      \<\!-- Primary \--\>  
      \<div class="flex flex-col gap-2"\>  
      \<div class="h-24 rounded-lg bg-primary shadow-sm w-full"\>\</div\>  
      \<div\>  
      \<p class="font-label-bold text-on-surface uppercase"\>Primary\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>bg-primary\</p\>  
      \</div\>  
      \</div\>  
      \<\!-- Primary Container \--\>  
      \<div class="flex flex-col gap-2"\>  
      \<div class="h-24 rounded-lg bg-primary-container shadow-sm w-full flex items-end p-2"\>  
      \<span class="text-on-primary-container font-label-bold"\>Text\</span\>  
      \</div\>  
      \<div\>  
      \<p class="font-label-bold text-on-surface uppercase"\>Pri. Container\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>bg-primary-container\</p\>  
      \</div\>  
      \</div\>  
      \<\!-- Secondary Container \--\>  
      \<div class="flex flex-col gap-2"\>  
      \<div class="h-24 rounded-lg bg-secondary-container shadow-sm w-full flex items-end p-2"\>  
      \<span class="text-on-secondary-container font-label-bold"\>Text\</span\>  
      \</div\>  
      \<div\>  
      \<p class="font-label-bold text-on-surface uppercase"\>Sec. Container\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>bg-secondary-container\</p\>  
      \</div\>  
      \</div\>  
      \<\!-- Surface \--\>  
      \<div class="flex flex-col gap-2"\>  
      \<div class="h-24 rounded-lg bg-surface border border-outline-variant shadow-sm w-full"\>\</div\>  
      \<div\>  
      \<p class="font-label-bold text-on-surface uppercase"\>Surface\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>bg-surface\</p\>  
      \</div\>  
      \</div\>  
      \</div\>  
      \<h3 class="font-h3 text-on-surface mb-md"\>Semantic Status\</h3\>  
      \<div class="grid grid-cols-1 md:grid-cols-3 gap-md"\>  
      \<div class="bg-surface p-4 rounded-lg border border-outline-variant flex items-center gap-4"\>  
      \<div class="w-8 h-8 rounded-full bg-\[\#E6F4EA\] text-\[\#1E8E3E\] flex items-center justify-center"\>  
      \<span class="material-symbols-outlined text-\[16px\]"\>check_circle\</span\>  
      \</div\>  
      \<div\>  
      \<p class="font-label-bold text-on-surface"\>SUCCESS\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>Confirmed / Active\</p\>  
      \</div\>  
      \</div\>  
      \<div class="bg-surface p-4 rounded-lg border border-outline-variant flex items-center gap-4"\>  
      \<div class="w-8 h-8 rounded-full bg-\[\#FFF3E0\] text-\[\#E65100\] flex items-center justify-center"\>  
      \<span class="material-symbols-outlined text-\[16px\]"\>warning\</span\>  
      \</div\>  
      \<div\>  
      \<p class="font-label-bold text-on-surface"\>WARNING\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>Pending / Review\</p\>  
      \</div\>  
      \</div\>  
      \<div class="bg-surface p-4 rounded-lg border border-outline-variant flex items-center gap-4"\>  
      \<div class="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center"\>  
      \<span class="material-symbols-outlined text-\[16px\]"\>error\</span\>  
      \</div\>  
      \<div\>  
      \<p class="font-label-bold text-on-surface"\>ERROR\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>Critical / Alert\</p\>  
      \</div\>  
      \</div\>  
      \</div\>  
      \</section\>  
      \<\!-- Components Showcase: Cards & Badges \--\>  
      \<section class="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-\[0_2px_4px_rgba(5,128,127,0.04)\]"\>  
      \<h2 class="font-h2 text-on-surface mb-lg flex items-center gap-2"\>  
      \<span class="material-symbols-outlined text-primary"\>widgets\</span\>  
       UI Components  
       \</h2\>  
      \<div class="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl"\>  
      \<\!-- KPI Card \--\>  
      \<div class="relative overflow-hidden bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-\[0_2px_8px_rgba(5,128,127,0.06)\] group hover:shadow-\[0_4px_12px_rgba(5,128,127,0.12)\] transition-shadow"\>  
      \<div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-container/10 to-transparent rounded-bl-full \-mr-8 \-mt-8 pointer-events-none"\>\</div\>  
      \<div class="flex justify-between items-start mb-4"\>  
      \<div\>  
      \<p class="font-body-sm text-on-surface-variant mb-1"\>Total Patients\</p\>  
      \<h3 class="font-h1 text-on-surface"\>1,248\</h3\>  
      \</div\>  
      \<div class="p-3 bg-surface rounded-lg text-primary"\>  
      \<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;"\>group\</span\>  
      \</div\>  
      \</div\>  
      \<div class="flex items-center gap-2 mt-4"\>  
      \<span class="flex items-center text-\[\#1E8E3E\] font-label-bold bg-\[\#E6F4EA\] px-2 py-1 rounded"\>  
      \<span class="material-symbols-outlined text-\[14px\] mr-1"\>trending_up\</span\>  
       12%  
       \</span\>  
      \<span class="font-body-sm text-on-surface-variant"\>vs last month\</span\>  
      \</div\>  
      \</div\>  
      \<\!-- Interactive List Item/Card \--\>  
      \<div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-\[0_2px_4px_rgba(5,128,127,0.04)\] flex flex-col justify-between"\>  
      \<div class="flex justify-between items-center mb-4 border-b border-outline-variant pb-4"\>  
      \<div class="flex items-center gap-3"\>  
      \<div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-h3"\>  
       JD  
       \</div\>  
      \<div\>  
      \<p class="font-h3 text-on-surface"\>John Doe\</p\>  
      \<p class="font-body-sm text-on-surface-variant"\>ID: \#CP-8829\</p\>  
      \</div\>  
      \</div\>  
      \<button class="text-on-surface-variant hover:text-primary transition-colors"\>  
      \<span class="material-symbols-outlined"\>more_vert\</span\>  
      \</button\>  
      \</div\>  
      \<div class="flex gap-2"\>  
      \<span class="px-3 py-1 bg-primary-container/10 text-primary-container font-label-bold rounded-full border border-primary-container/20"\>Mensalista\</span\>  
      \<span class="px-3 py-1 bg-surface-variant text-on-surface-variant font-label-bold rounded-full border border-outline-variant"\>Avulso\</span\>  
      \</div\>  
      \</div\>  
      \</div\>  
      \</section\>  
      \</div\>  
      \<\!-- Right Column (Narrower) \--\>  
      \<div class="lg:col-span-4 flex flex-col gap-xl"\>  
      \<\!-- Typography \--\>  
      \<section class="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-\[0_2px_4px_rgba(5,128,127,0.04)\]"\>  
      \<h2 class="font-h2 text-on-surface mb-lg flex items-center gap-2"\>  
      \<span class="material-symbols-outlined text-primary"\>text_fields\</span\>  
       Typography  
       \</h2\>  
      \<div class="flex flex-col gap-6"\>  
      \<div\>  
      \<p class="font-body-sm text-on-surface-variant mb-1"\>Heading 1 (Manrope 32px)\</p\>  
      \<h1 class="font-h1 text-on-surface"\>Section Title\</h1\>  
      \</div\>  
      \<div class="pt-4 border-t border-outline-variant"\>  
      \<p class="font-body-sm text-on-surface-variant mb-1"\>Heading 2 (Manrope 24px)\</p\>  
      \<h2 class="font-h2 text-on-surface"\>Card Heading\</h2\>  
      \</div\>  
      \<div class="pt-4 border-t border-outline-variant"\>  
      \<p class="font-body-sm text-on-surface-variant mb-1"\>Heading 3 (Manrope 20px)\</p\>  
      \<h3 class="font-h3 text-on-surface"\>Small Title\</h3\>  
      \</div\>  
      \<div class="pt-4 border-t border-outline-variant"\>  
      \<p class="font-body-sm text-on-surface-variant mb-1"\>Body Large (Inter 16px)\</p\>  
      \<p class="font-body-lg text-on-surface"\>Standard paragraph text for longer descriptions.\</p\>  
      \</div\>  
      \<div class="pt-4 border-t border-outline-variant"\>  
      \<p class="font-body-sm text-on-surface-variant mb-1"\>Label Bold (Inter 12px)\</p\>  
      \<p class="font-label-bold text-primary uppercase tracking-wider"\>BUTTON LABEL\</p\>  
      \</div\>  
      \</div\>  
      \</section\>  
      \<\!-- Buttons \--\>  
      \<section class="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-\[0_2px_4px_rgba(5,128,127,0.04)\]"\>  
      \<h2 class="font-h2 text-on-surface mb-lg flex items-center gap-2"\>  
      \<span class="material-symbols-outlined text-primary"\>smart_button\</span\>  
       Buttons  
       \</h2\>  
      \<div class="flex flex-col gap-4"\>  
      \<button class="w-full bg-secondary-container text-primary-container font-label-bold uppercase tracking-wider py-3 px-4 rounded-lg hover:bg-secondary-fixed transition-colors"\>  
       Primary Action  
       \</button\>  
      \<button class="w-full bg-surface-container-lowest border-2 border-primary text-primary font-label-bold uppercase tracking-wider py-3 px-4 rounded-lg hover:bg-surface transition-colors"\>  
       Secondary Action  
       \</button\>  
      \<button class="w-full text-on-surface-variant font-label-bold uppercase tracking-wider py-3 px-4 rounded-lg hover:bg-surface-variant transition-colors"\>  
       Ghost Button  
       \</button\>  
      \</div\>  
      \</section\>  
      \</div\>  
      \</div\>  
      \</div\>  
      \<\!-- Footer \--\>  
      \<footer class="w-full py-12 border-t border-outline-variant bg-surface mt-xl"\>  
      \<div class="flex flex-col md:flex-row items-center justify-between px-8 max-w-\[1440px\] mx-auto"\>  
      \<p class="font-body-sm text-on-surface-variant"\>© 2024 ClinicPro Modern. Clinical Precision \&amp; Patient Care.\</p\>  
      \<div class="flex gap-6 mt-4 md:mt-0"\>  
      \<a class="font-body-sm text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary" href="\#"\>Privacy Policy\</a\>  
      \<a class="font-body-sm text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary" href="\#"\>Terms of Service\</a\>  
      \<a class="font-body-sm text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary" href="\#"\>Security Compliance\</a\>  
      \</div\>  
      \</div\>  
      \</footer\>  
      \</main\>  
      \</body\>\</html\>
