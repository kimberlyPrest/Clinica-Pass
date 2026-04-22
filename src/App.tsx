import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import DashboardMedico from './pages/DashboardMedico'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './hooks/use-auth'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard-medico" element={<DashboardMedico />} />
              <Route
                path="/medicos"
                element={
                  <div className="p-8 text-muted-foreground">Lista de Médicos (Em breve)</div>
                }
              />
              <Route
                path="/salas"
                element={
                  <div className="p-8 text-muted-foreground">Gestão de Salas (Em breve)</div>
                }
              />
              <Route
                path="/agenda"
                element={<div className="p-8 text-muted-foreground">Agenda (Em breve)</div>}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
