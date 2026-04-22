import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { User } from 'lucide-react'

export default function Perfil() {
  const { user } = useAuth()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Visualize suas informações pessoais.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
          <CardDescription>Informações cadastradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <div className="bg-secondary p-4 rounded-full mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">{user?.name || 'Usuário'}</h2>
          <p>{user?.email}</p>
          <p className="mt-3 text-xs uppercase bg-primary/10 px-2.5 py-1 rounded font-bold text-primary inline-block">
            {user?.tipo_acesso}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
