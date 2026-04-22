import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { DashboardFilters, Period } from './types'
import { MOCK_ROOMS, MOCK_DOCTOR_TYPES } from './mock-data'

interface FiltersProps {
  filters: DashboardFilters
  onChange: (filters: DashboardFilters) => void
}

export function DashboardFiltersPanel({ filters, onChange }: FiltersProps) {
  const periods: Period[] = ['Dia', 'Semana', 'Mês']

  return (
    <div className="bg-card p-6 rounded-xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-muted-foreground">Período</h2>
          <div className="flex gap-2">
            {periods.map((p) => (
              <Badge
                key={p}
                variant={filters.period === p ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 text-sm transition-colors hover:bg-primary/80"
                onClick={() => onChange({ ...filters, period: p })}
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-muted-foreground">
            Médicos (Categorias)
          </h2>
          <div className="flex flex-wrap gap-4">
            {MOCK_DOCTOR_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`doc-${type}`}
                  checked={filters.doctorTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...filters.doctorTypes, type]
                      : filters.doctorTypes.filter((t) => t !== type)
                    onChange({ ...filters, doctorTypes: newTypes })
                  }}
                />
                <label
                  htmlFor={`doc-${type}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between pt-6 border-t">
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-muted-foreground">
            Salas Disponíveis
          </h2>
          <div className="flex flex-wrap gap-4">
            {MOCK_ROOMS.map((room) => (
              <div key={room} className="flex items-center space-x-2">
                <Checkbox
                  id={room}
                  checked={filters.rooms.includes(room)}
                  onCheckedChange={(checked) => {
                    const newRooms = checked
                      ? [...filters.rooms, room]
                      : filters.rooms.filter((r) => r !== room)
                    onChange({ ...filters, rooms: newRooms })
                  }}
                />
                <label htmlFor={room} className="text-sm font-medium leading-none cursor-pointer">
                  {room}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full lg:max-w-md space-y-3">
          <h2 className="text-sm font-display font-semibold text-muted-foreground">
            Ocupação Esperada: {filters.occupancy[0]}% - {filters.occupancy[1]}%
          </h2>
          <Slider
            value={filters.occupancy}
            max={100}
            step={5}
            onValueChange={(v) => onChange({ ...filters, occupancy: v })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
