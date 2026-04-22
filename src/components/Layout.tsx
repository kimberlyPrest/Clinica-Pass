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
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Stethoscope,
  DoorOpen,
  CalendarDays,
  Building2,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const isMedico = user?.tipo_acesso === 'medico'

  const navItems = isMedico
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard-medico' },
        { icon: CalendarDays, label: 'Minha Agenda', path: '/agenda' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Stethoscope, label: 'Médicos', path: '/medicos' },
        { icon: DoorOpen, label: 'Salas', path: '/salas' },
        { icon: CalendarDays, label: 'Agenda', path: '/agenda' },
      ]

  const avatarUrl = user?.avatar ? pb.files.getURL(user, user.avatar) : ''
  const displayRole = isMedico ? 'Médico' : 'Admin Clínica'

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r bg-card/50">
          <SidebarHeader className="p-6 border-b border-border/50">
            <div className="flex flex-col items-center gap-4 text-center mt-4">
              <Avatar className="w-16 h-16 shadow-sm border-2 border-primary/20">
                <AvatarImage src={avatarUrl} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-display font-bold text-primary">
                  {user?.name || 'Usuário'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{displayRole}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-8">
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-12 px-4 mb-2 rounded-lg transition-all',
                        isActive
                          ? 'bg-secondary/40 text-primary font-bold relative overflow-hidden before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-primary before:rounded-r-md'
                          : 'text-muted-foreground hover:bg-secondary/20 hover:text-primary',
                      )}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'w-5 h-5',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                          )}
                        />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 space-y-4 border-t border-border/50">
            {!isMedico && (
              <Button
                variant="secondary"
                className="w-full justify-start gap-3 bg-secondary/30 hover:bg-secondary/50 text-primary font-bold"
              >
                <Building2 className="w-4 h-4" />
                SELECIONAR UNIDADE
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
