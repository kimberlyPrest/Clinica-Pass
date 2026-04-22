import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Resource {
  id: string
  label: string
  category: string
  clinica: boolean
  medico: boolean
}

const DEFAULT_PERMISSIONS: Resource[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Geral',
    category: 'Visão Geral',
    clinica: true,
    medico: false,
  },
  {
    id: 'medico_dashboard',
    label: 'Painel do Médico',
    category: 'Visão Geral',
    clinica: false,
    medico: true,
  },
  { id: 'salas_view', label: 'Visualizar Salas', category: 'Salas', clinica: true, medico: true },
  { id: 'salas_edit', label: 'Editar Salas', category: 'Salas', clinica: true, medico: false },
  {
    id: 'agenda_view',
    label: 'Agenda Geral da Clínica',
    category: 'Agenda',
    clinica: true,
    medico: false,
  },
  {
    id: 'medico_reservas',
    label: 'Reservar Salas',
    category: 'Agenda',
    clinica: true,
    medico: true,
  },
  {
    id: 'medico_calendario',
    label: 'Calendário Pessoal',
    category: 'Agenda',
    clinica: false,
    medico: true,
  },
  {
    id: 'medicos_list',
    label: 'Lista de Médicos',
    category: 'Médicos',
    clinica: true,
    medico: false,
  },
  {
    id: 'medico_details',
    label: 'Perfil do Médico',
    category: 'Médicos',
    clinica: true,
    medico: true,
  },
  {
    id: 'medicos_create',
    label: 'Cadastrar Médicos',
    category: 'Médicos',
    clinica: true,
    medico: false,
  },
  {
    id: 'pacientes_view',
    label: 'Gerenciar Pacientes',
    category: 'Pacientes',
    clinica: false,
    medico: true,
  },
  {
    id: 'configuracoes',
    label: 'Configurações do Sistema',
    category: 'Sistema',
    clinica: true,
    medico: false,
  },
  {
    id: 'usuarios_view',
    label: 'Ver Usuários do Sistema',
    category: 'Sistema',
    clinica: true,
    medico: false,
  },
]

const STORAGE_KEY = 'clinicapass_permissions'

function loadPermissions(): Resource[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (error) {
    // Ignore JSON parse errors and return defaults
  }
  return DEFAULT_PERMISSIONS
}

export function PermissoesTable() {
  const [resources, setResources] = useState<Resource[]>(loadPermissions)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources))
  }, [resources])

  const toggle = (id: string, role: 'clinica' | 'medico') => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, [role]: !r[role] } : r)))
  }

  const categories = [...new Set(resources.map((r) => r.category))]

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Recurso</TableHead>
            <TableHead className="text-center w-32">
              <Badge variant="default" className="bg-primary">
                Clínica
              </Badge>
            </TableHead>
            <TableHead className="text-center w-32">
              <Badge variant="secondary">Médico</Badge>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <>
              <TableRow key={`cat-${category}`} className="bg-muted/10">
                <TableCell
                  colSpan={3}
                  className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {category}
                </TableCell>
              </TableRow>
              {resources
                .filter((r) => r.category === category)
                .map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium pl-6">{r.label}</TableCell>
                    <TableCell className="text-center">
                      <Switch checked={r.clinica} onCheckedChange={() => toggle(r.id, 'clinica')} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={r.medico} onCheckedChange={() => toggle(r.id, 'medico')} />
                    </TableCell>
                  </TableRow>
                ))}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
