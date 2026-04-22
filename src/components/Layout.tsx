import { Outlet, Link, useLocation } from 'react-router-dom'
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
  PlusSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Stethoscope, label: 'Médicos', path: '/medicos' },
    { icon: DoorOpen, label: 'Salas', path: '/salas' },
    { icon: CalendarDays, label: 'Agenda', path: '/agenda' },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r bg-card/50">
          <SidebarHeader className="p-6 border-b border-border/50">
            <div className="flex flex-col items-center gap-4 text-center mt-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm">
                <PlusSquare className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-primary">Dr. Clinic Admin</h2>
                <p className="text-xs text-muted-foreground mt-1">Nível de Acesso: Médico/Admin</p>
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
            <Button
              variant="secondary"
              className="w-full justify-start gap-3 bg-secondary/30 hover:bg-secondary/50 text-primary font-bold"
            >
              <Building2 className="w-4 h-4" />
              SELECIONAR UNIDADE
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-center gap-3 text-muted-foreground hover:text-foreground"
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
