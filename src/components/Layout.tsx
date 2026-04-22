import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  LayoutDashboard,
  Stethoscope,
  DoorOpen,
  CalendarDays,
  Settings,
  LogOut,
  User as UserIcon,
  Users,
  ChevronUp,
  ChevronDown,
  ClipboardList,
  Clock,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import logoImg from '@/assets/espaco-integer.pdf-70f5f.png'
import { Button } from '@/components/ui/button'
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar'
import { EditarHorariosFixosModal } from '@/pages/medico/components/EditarHorariosFixosModal'

function LayoutContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { setOpen } = useSidebar()
  const [medico, setMedico] = useState<any>(null)
  const [editarHorariosOpen, setEditarHorariosOpen] = useState(false)

  const fetchMedico = () => {
    if (user?.id && user?.tipo_acesso === 'medico') {
      pb.collection('medicos')
        .getFirstListItem(`usuario_id="${user.id}"`)
        .then((m) => setMedico(m))
        .catch(() => {})
    }
  }

  useEffect(() => {
    fetchMedico()
  }, [user?.id])

  useEffect(() => {
    const handleResize = () => {
      // Collapse on tablet (768px - 1024px)
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setOpen(false)
      } else if (window.innerWidth >= 1024) {
        setOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize() // init
    return () => window.removeEventListener('resize', handleResize)
  }, [setOpen])

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const isMedico = user?.tipo_acesso === 'medico'
  const isMensalista = isMedico && medico?.tipo === 'mensalista'

  const getHorariosSummary = () => {
    if (!medico?.horarios_fixos) return 'Nenhum horário fixo'
    const horarios = medico.horarios_fixos
    const dayNames: Record<string, string> = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom',
    }
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const grouped: Record<string, string[]> = {}

    for (const day of dayOrder) {
      const slots = horarios[day]
      if (slots && slots.length > 0) {
        const start = slots[0]
        const end = slots[slots.length - 1]
        const key = `${start}-${end}`
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(dayNames[day])
      }
    }

    const parts = Object.entries(grouped).map(([time, days]) => {
      return `${days.join('/')} ${time}`
    })

    return parts.length > 0 ? parts.join('; ') : 'Nenhum horário fixo'
  }

  const clinicaNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Stethoscope, label: 'Médicos', path: '/medicos' },
    { icon: DoorOpen, label: 'Salas', path: '/gestao-salas' },
    { icon: CalendarDays, label: 'Agenda', path: '/agenda' },
    { icon: ClipboardList, label: 'Gestão Reservas', path: '/gestao-reservas' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ]

  const medicoNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/medico/dashboard' },
    { icon: ClipboardList, label: 'Minhas Reservas', path: '/medico/reservas' },
    { icon: CalendarDays, label: 'Calendário', path: '/medico/calendario' },
    { icon: Users, label: 'Pacientes', path: '/medico/pacientes' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ]

  const mensalistaSubItems = [
    { label: 'Meus Horários Fixos', path: '/medico/reservas' },
    { label: 'Cancelar Horário', path: '/medico/dashboard' },
  ]

  const navItems = isMedico ? medicoNavItems : clinicaNavItems

  const avatarUrl = user?.avatar ? pb.files.getURL(user, user.avatar) : ''
  const displayRole = isMedico ? 'Médico' : 'Clínica'
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'US'

  return (
    <div className="flex min-h-screen w-full bg-background transition-all duration-200 ease-in-out">
      <Sidebar
        collapsible="icon"
        className="border-[#bdc9c8] [&_[data-sidebar=sidebar]]:bg-[#f7f9fb] transition-all duration-200 ease-in-out z-20"
      >
        <SidebarHeader className="h-[80px] p-4 flex flex-col justify-center border-b border-[#bdc9c8]/30 overflow-hidden">
          <div className="flex items-center justify-center h-full w-full">
            <img
              src={logoImg}
              alt="Espaço Integer"
              className="max-h-[72px] w-auto object-contain transition-all duration-200 group-data-[collapsible=icon]:hidden"
            />
            <img
              src={logoImg}
              alt="Espaço Integer"
              className="h-10 w-10 max-w-none object-cover object-left hidden group-data-[collapsible=icon]:block transition-all duration-200"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="p-0 overflow-y-auto overflow-x-hidden">
          <SidebarMenu className="gap-4 px-6 group-data-[collapsible=icon]:px-2 py-6">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname.startsWith(item.path + '/') && item.path !== '/')
              const isMensalistaReservas = isMensalista && item.path === '/medico/reservas'

              if (isMensalistaReservas) {
                return (
                  <Collapsible key={item.label} defaultOpen={isActive}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          className={cn(
                            'h-12 px-4 rounded-lg transition-all duration-200 font-sans text-[14px] w-full',
                            isActive
                              ? '!bg-[#05807f] !text-white hover:!bg-[#05807f]/90'
                              : 'text-muted-foreground hover:!bg-[#f0dfd5] hover:!text-[#05807f]',
                            'group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center',
                          )}
                        >
                          <item.icon
                            className={cn(
                              'w-5 h-5 shrink-0',
                              isActive ? 'text-white' : 'text-muted-foreground',
                            )}
                          />
                          <span className="truncate group-data-[collapsible=icon]:hidden flex-1">
                            {item.label}
                          </span>
                          <ChevronDown className="w-4 h-4 group-data-[collapsible=icon]:hidden shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="group-data-[collapsible=icon]:hidden mt-1">
                          {mensalistaSubItems.map((sub) => (
                            <SidebarMenuSubItem key={sub.label}>
                              <SidebarMenuSubButton asChild>
                                <Link to={sub.path} className="flex items-center gap-2 text-xs">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  {sub.label}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={item.label} className="transition-all duration-200">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      'h-12 px-4 rounded-lg transition-all duration-200 font-sans text-[14px] w-full',
                      isActive
                        ? '!bg-[#05807f] !text-white hover:!bg-[#05807f]/90'
                        : 'text-muted-foreground hover:!bg-[#f0dfd5] hover:!text-[#05807f]',
                      'group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center',
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-3 w-full">
                      <item.icon
                        className={cn(
                          'w-5 h-5 shrink-0 transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-muted-foreground group-hover/menu-button:text-[#05807f]',
                        )}
                      />
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>

          {isMensalista && (
            <SidebarGroup className="mt-auto px-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:hidden mb-4">
              <SidebarGroupLabel className="px-0 text-xs font-semibold text-[#05807f] mb-1">
                Meus Horários Fixos
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-2 flex flex-col items-start gap-1 justify-start px-3 bg-[#f0dfd5]/30 border-[#05807f]/20 hover:bg-[#f0dfd5]/50"
                    >
                      <span className="text-[11px] text-muted-foreground whitespace-normal text-left leading-tight">
                        {getHorariosSummary()}
                      </span>
                      <span className="text-xs font-medium text-[#05807f] mt-1 flex items-center gap-1">
                        Gerenciar <ChevronDown className="w-3 h-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[200px] border-[#bdc9c8]/50 shadow-elevation"
                  >
                    <DropdownMenuItem
                      onClick={() => setEditarHorariosOpen(true)}
                      className="cursor-pointer focus:!bg-[#f0dfd5]/50 focus:!text-[#05807f]"
                    >
                      <Clock className="mr-2 w-4 h-4 text-muted-foreground" /> Editar Horários
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/medico/reservas')}
                      className="cursor-pointer focus:!bg-[#f0dfd5]/50 focus:!text-[#05807f]"
                    >
                      <CalendarDays className="mr-2 w-4 h-4 text-muted-foreground" /> Reservar Mais
                      Horários
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="h-[60px] p-0 border-t border-[#bdc9c8]/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full h-full data-[state=open]:!bg-[#f0dfd5] data-[state=open]:!text-[#05807f] hover:!bg-[#f0dfd5] hover:!text-[#05807f] rounded-none px-6 group-data-[collapsible=icon]:px-2 transition-all duration-200"
              >
                <Avatar className="h-10 w-10 shrink-0 rounded-full border border-[#05807f]/20 group-data-[collapsible=icon]:mx-auto transition-all duration-200">
                  <AvatarImage src={avatarUrl} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-[#05807f]/10 text-[#05807f] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-3">
                  <span className="truncate font-semibold text-foreground">
                    {user?.name || 'Usuário'}
                  </span>
                  <span className="truncate text-xs mt-0.5">
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] uppercase font-bold bg-[#05807f]/10 text-[#05807f] border-none rounded"
                    >
                      {displayRole}
                    </Badge>
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg shadow-elevation border-[#bdc9c8]/50"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-3 py-3 text-left text-sm border-b border-border/50">
                  <Avatar className="h-9 w-9 rounded-full">
                    <AvatarImage src={avatarUrl} alt={user?.name || ''} />
                    <AvatarFallback className="bg-[#05807f]/10 text-[#05807f] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {user?.name || 'Usuário'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <div className="p-1">
                <DropdownMenuItem
                  className="cursor-pointer gap-2 py-2 rounded-md focus:!bg-[#f0dfd5]/50 focus:!text-[#05807f]"
                  asChild
                >
                  <Link to="/perfil">
                    <UserIcon className="w-4 h-4 text-muted-foreground" /> Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 py-2 rounded-md focus:!bg-[#f0dfd5]/50 focus:!text-[#05807f]"
                  asChild
                >
                  <Link to="/perfil/editar">
                    <Settings className="w-4 h-4 text-muted-foreground" /> Editar Perfil
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 py-2 rounded-md text-muted-foreground focus:!text-[#05807f] focus:!bg-[#f0dfd5]/50 group"
                >
                  <LogOut className="w-4 h-4 group-focus:text-[#05807f] transition-colors" /> Sair
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
        <header className="h-16 border-b border-border/50 flex items-center px-4 md:hidden shrink-0 bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger className="mr-3 text-muted-foreground hover:text-foreground" />
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Espaço Integer" className="h-8 w-auto object-contain" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto w-full max-w-[100vw]">
          <Outlet />
        </div>
      </main>

      {medico && (
        <EditarHorariosFixosModal
          open={editarHorariosOpen}
          onOpenChange={setEditarHorariosOpen}
          medico={medico}
          onSuccess={fetchMedico}
        />
      )}
    </div>
  )
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  )
}
