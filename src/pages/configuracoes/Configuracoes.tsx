import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Shield } from 'lucide-react'
import { UsuariosTable } from '@/components/configuracoes/UsuariosTable'
import { PermissoesTable } from '@/components/configuracoes/PermissoesTable'

export default function Configuracoes() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie usuários e permissões do sistema.</p>
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList className="mb-4">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Usuários do Sistema</h2>
              <p className="text-sm text-muted-foreground">
                Todos os usuários cadastrados, seus papéis e vínculos no sistema.
              </p>
            </div>
            <UsuariosTable />
          </div>
        </TabsContent>

        <TabsContent value="permissoes">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Permissões por Papel</h2>
              <p className="text-sm text-muted-foreground">
                Defina quais recursos cada papel de usuário pode acessar. As alterações são salvas
                automaticamente.
              </p>
            </div>
            <PermissoesTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
