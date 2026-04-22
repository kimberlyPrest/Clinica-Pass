import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExternalLink } from 'lucide-react'

interface SystemUser {
  id: string
  name: string
  email: string
  tipo_acesso: 'clinica' | 'medico'
  created: string
  medicoId?: string
}

export function UsuariosTable() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersData, medicosData] = await Promise.all([
          pb.collection('users').getFullList({ sort: 'name' }),
          pb.collection('medicos').getFullList({ fields: 'id,user_id' }),
        ])

        const medicoMap = new Map(medicosData.map((m: any) => [m.user_id, m.id]))

        setUsers(
          usersData.map((u: any) => ({
            id: u.id,
            name: u.name || u.email || 'Usuário',
            email: u.email || '',
            tipo_acesso: u.tipo_acesso || 'medico',
            created: u.created,
            medicoId: medicoMap.get(u.id),
          })),
        )
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Usuário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} className="hover:bg-muted/20">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-primary/10 text-primary text-xs font-bold">
                    <AvatarFallback className="bg-transparent">
                      {(u.name || 'US').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{u.name || 'Usuário'}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <Badge
                  variant={u.tipo_acesso === 'clinica' ? 'default' : 'secondary'}
                  className={u.tipo_acesso === 'clinica' ? 'bg-primary' : ''}
                >
                  {u.tipo_acesso === 'clinica' ? 'Clínica' : 'Médico'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {u.created ? format(parseISO(u.created), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {u.tipo_acesso === 'medico' && u.medicoId && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/medicos/${u.medicoId}`}>
                      <ExternalLink className="h-4 w-4 mr-1" /> Ver Perfil
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
