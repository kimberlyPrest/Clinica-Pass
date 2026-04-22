import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createBloqueio } from '@/services/bloqueios'
import { useToast } from '@/hooks/use-toast'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const formSchema = z.object({
  tipo: z.enum(['pontual', 'diario', 'semanal', 'mensal', 'periodo', 'recorrencia_complexa']),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  hora_inicio: z.string().optional(),
  hora_fim: z.string().optional(),
  dias_semana: z.array(z.string()).optional(),
})

export function BloqueioFormModal({
  open,
  onOpenChange,
  salaId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaId: string
}) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { tipo: 'pontual', dias_semana: [] },
  })

  const tipo = form.watch('tipo')

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createBloqueio({ ...values, sala_id: salaId })
      toast({ title: 'Bloqueio criado com sucesso' })
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Bloqueio</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de bloqueio</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      {[
                        'pontual',
                        'diario',
                        'semanal',
                        'mensal',
                        'periodo',
                        'recorrencia_complexa',
                      ].map((t) => (
                        <div key={t} className="flex items-center space-x-2">
                          <RadioGroupItem value={t} id={t} />
                          <label
                            htmlFor={t}
                            className="text-sm font-medium leading-none capitalize cursor-pointer"
                          >
                            {t.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-secondary/20 p-4 rounded-lg space-y-4 border">
              {(tipo === 'pontual' || tipo === 'periodo') && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="data_inicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Início</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {tipo === 'periodo' && (
                    <FormField
                      control={form.control}
                      name="data_fim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Fim</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {(tipo === 'diario' || tipo === 'semanal') && (
                <FormField
                  control={form.control}
                  name="dias_semana"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias da Semana</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          onValueChange={field.onChange}
                          className="justify-start flex-wrap gap-1"
                        >
                          {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((d) => (
                            <ToggleGroupItem
                              key={d}
                              value={d}
                              className="h-8 px-2 text-xs bg-background data-[state=on]:bg-primary data-[state=on]:text-white"
                            >
                              {d}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {tipo === 'recorrencia_complexa' && (
                <FormField
                  control={form.control}
                  name="data_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Padrão (Ex: "2º domingo de cada mês")</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {tipo !== 'periodo' && tipo !== 'recorrencia_complexa' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hora_inicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora Início</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hora_fim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora Fim</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Bloqueio</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
