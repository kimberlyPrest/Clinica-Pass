import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sala, createSala, updateSala } from '@/services/salas'
import { Bloqueio, deleteBloqueio } from '@/services/bloqueios'
import { Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  status: z.enum(['ativa', 'inativa']),
  horario_inicio: z.string().min(1, 'Obrigatório'),
  horario_fim: z.string().min(1, 'Obrigatório'),
  dias_funcionamento: z.array(z.string()).min(1, 'Selecione pelo menos um dia'),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sala?: Sala
  bloqueios?: Bloqueio[]
  onAddBlock: (salaId: string) => void
}

const DIAS = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sáb' },
  { value: 'dom', label: 'Dom' },
]

export function SalaFormModal({ open, onOpenChange, sala, bloqueios = [], onAddBlock }: Props) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: sala?.nome || '',
      status: sala?.status || 'ativa',
      horario_inicio: sala?.horario_inicio || '08:00',
      horario_fim: sala?.horario_fim || '18:00',
      dias_funcionamento: sala?.dias_funcionamento || ['seg', 'ter', 'qua', 'qui', 'sex'],
    },
  })

  useEffect(() => {
    if (sala) form.reset({ ...sala })
  }, [sala, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (sala) await updateSala(sala.id, values)
      else await createSala(values)

      toast({ title: 'Sucesso', description: 'Sala salva com sucesso.' })
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
    }
  }

  const handleDeleteBlock = async (id: string) => {
    try {
      await deleteBloqueio(id)
      toast({ title: 'Bloqueio removido' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col px-0">
        <SheetHeader className="px-6 border-b pb-4">
          <SheetTitle>{sala ? 'Configurar Sala' : 'Nova Sala'}</SheetTitle>
          <SheetDescription>
            {sala
              ? 'Gerencie as configurações e bloqueios desta sala.'
              : 'Preencha os dados da nova sala.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 pt-4">
          <Form {...form}>
            <form id="sala-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Sala</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="inativa">Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="horario_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abertura</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="horario_fim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fechamento</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dias_funcionamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de Funcionamento</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="multiple"
                        value={field.value}
                        onValueChange={field.onChange}
                        className="justify-start gap-1 flex-wrap"
                      >
                        {DIAS.map((d) => (
                          <ToggleGroupItem
                            key={d.value}
                            value={d.value}
                            className="h-8 px-2 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            {d.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {sala && (
            <div className="mt-8 space-y-4 pb-8">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-sm">Bloqueios Específicos</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-primary"
                  onClick={() => onAddBlock(sala.id)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
              {bloqueios.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum bloqueio registrado.</p>
              ) : (
                <div className="space-y-2">
                  {bloqueios.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between bg-secondary/20 p-2 rounded-md border text-sm"
                    >
                      <div>
                        <p className="font-medium capitalize">{b.tipo.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.hora_inicio && b.hora_fim
                            ? `${b.hora_inicio} às ${b.hora_fim}`
                            : 'Dia todo'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteBlock(b.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 border-t mt-auto">
          <Button type="submit" form="sala-form" className="w-full">
            Salvar Configurações
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
