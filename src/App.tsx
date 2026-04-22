import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import MedicosList from './pages/medicos/MedicosList'
import MedicoDetails from './pages/medicos/MedicoDetails'
import SalasList from './pages/salas/SalasList'
import Agenda from './pages/agenda/Agenda'
import Dashboard from './pages/medico/Dashboard'
import Reservas from './pages/medico/Reservas'
import Calendario from './pages/medico/Calendario'
import Pacientes from './pages/medico/Pacientes'
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
              <Route path="/medico/dashboard" element={<Dashboard />} />
              <Route path="/medico/reservas" element={<Reservas />} />
              <Route path="/medico/calendario" element={<Calendario />} />
              <Route path="/medico/pacientes" element={<Pacientes />} />
              <Route path="/medicos" element={<MedicosList />} />
              <Route path="/medicos/:id" element={<MedicoDetails />} />
              <Route path="/gestao-salas" element={<SalasList />} />
              <Route path="/agenda" element={<Agenda />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
