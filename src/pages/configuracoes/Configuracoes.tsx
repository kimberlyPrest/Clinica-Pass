import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Shield, UserSquare } from 'lucide-react'
import { UsuariosTable } from '@/components/configuracoes/UsuariosTable'
import { PermissoesTable } from '@/components/configuracoes/PermissoesTable'
import { CamposCustomizadosTable } from '@/components/configuracoes/CamposCustomizadosTable'
import { PageWrapper, PageHeader, DSCard, DSCardHeader } from '@/components/ui/design-system'

export default function Configuracoes() {
  return (
    <PageWrapper>
      <PageHeader title="Configurações" subtitle="Gerencie usuários e permissões do sistema" />

      <Tabs defaultValue="usuarios">
        {/* Custom tab bar */}
        <div className="flex gap-1 bg-white rounded-xl border border-[#e6e8ea] p-1 w-fit shadow-[0_2px_4px_rgba(5,128,127,0.04)] mb-6">
          <TabsList className="bg-transparent gap-1 p-0">
            <TabsTrigger
              value="usuarios"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#6e7979]
                data-[state=active]:bg-[#05807f] data-[state=active]:text-white data-[state=active]:shadow-sm
                hover:bg-[#f0dfd5] hover:text-[#05807f] transition-all duration-200"
            >
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger
              value="permissoes"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#6e7979]
                data-[state=active]:bg-[#05807f] data-[state=active]:text-white data-[state=active]:shadow-sm
                hover:bg-[#f0dfd5] hover:text-[#05807f] transition-all duration-200"
            >
              <Shield className="w-4 h-4" />
              Permissões
            </TabsTrigger>
            <TabsTrigger
              value="pacientes"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#6e7979]
                data-[state=active]:bg-[#05807f] data-[state=active]:text-white data-[state=active]:shadow-sm
                hover:bg-[#f0dfd5] hover:text-[#05807f] transition-all duration-200"
            >
              <UserSquare className="w-4 h-4" />
              Pacientes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="usuarios" className="mt-0">
          <DSCard padded={false}>
            <DSCardHeader
              title="Usuários do Sistema"
              subtitle="Todos os usuários cadastrados, seus papéis e vínculos no sistema"
            />
            <div className="p-6">
              <UsuariosTable />
            </div>
          </DSCard>
        </TabsContent>

        <TabsContent value="permissoes" className="mt-0">
          <DSCard padded={false}>
            <DSCardHeader
              title="Permissões por Papel"
              subtitle="Defina quais recursos cada papel pode acessar. Alterações são salvas automaticamente"
            />
            <div className="p-6">
              <PermissoesTable />
            </div>
          </DSCard>
        </TabsContent>

        <TabsContent value="pacientes" className="mt-0">
          <DSCard padded={false}>
            <DSCardHeader
              title="Campos Customizados"
              subtitle="Configure os campos clínicos adicionais para os pacientes"
            />
            <div className="p-6">
              <CamposCustomizadosTable />
            </div>
          </DSCard>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  )
}
