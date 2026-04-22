import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function Configuracoes() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Ajuste as preferências do sistema e perfil.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>Módulo em desenvolvimento.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Settings className="w-12 h-12 mb-4 opacity-20" />
          <p>Esta funcionalidade estará disponível em breve.</p>
        </CardContent>
      </Card>
    </div>
  )
}
