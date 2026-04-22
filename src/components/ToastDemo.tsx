import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export function ToastDemo() {
  const { showToast } = useToast()

  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 left-4 z-[200] flex flex-col gap-2 p-4 bg-background border rounded-lg shadow-lg">
      <p className="text-xs font-bold mb-2 uppercase text-muted-foreground">
        Toast Demo (Dev Only)
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          showToast({
            type: 'success',
            title: 'Médico salvo com sucesso',
            description: 'Dr. Carlos Oliveira foi adicionado ao sistema',
          })
        }
      >
        Success Toast
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          showToast({
            type: 'error',
            title: 'Erro ao salvar médico',
            description: 'Email já cadastrado no sistema',
          })
        }
      >
        Error Toast
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          showToast({
            type: 'warning',
            title: 'Atenção',
            description: 'Soma de consultas (3h) excede duração da reserva (2h30)',
          })
        }
      >
        Warning Toast
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          showToast({
            type: 'info',
            title: 'Carregando dados...',
          })
        }
      >
        Info Toast
      </Button>
    </div>
  )
}
