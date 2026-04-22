import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

function MultiSelect({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: any[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full md:w-[200px] justify-between">
          {selected.length > 0 ? `${selected.length} selecionado(s)` : title}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Buscar ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nenhum encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  onSelect={() => {
                    if (selected.includes(opt.value)) {
                      onChange(selected.filter((s) => s !== opt.value))
                    } else {
                      onChange([...selected, opt.value])
                    }
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(opt.value) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function ReservaFiltros(props: any) {
  const {
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    medicoFilter,
    setMedicoFilter,
    salaFilter,
    setSalaFilter,
    medicos,
    salas,
  } = props
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(localSearch), 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearch])

  return (
    <div className="flex flex-col xl:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar médico ou paciente..."
          className="pl-8"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap xl:flex-nowrap">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mês</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os Status</SelectItem>
            <SelectItem value="ativa">Ativa</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <MultiSelect
          title="Médicos"
          options={(Array.isArray(medicos) ? medicos : []).map((m: any) => ({
            value: m.id,
            label: m.nome,
          }))}
          selected={medicoFilter || []}
          onChange={setMedicoFilter}
        />
        <MultiSelect
          title="Salas"
          options={(Array.isArray(salas) ? salas : []).map((s: any) => ({
            value: s.id,
            label: s.nome,
          }))}
          selected={salaFilter || []}
          onChange={setSalaFilter}
        />
      </div>
    </div>
  )
}
