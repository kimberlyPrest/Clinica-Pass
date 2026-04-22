import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']

export function ChartsSection({ lineData, pieData }: { lineData: any[]; pieData: any[] }) {
  const pieConfig = {
    'Sala 1': { label: 'Sala 1', color: pieColors[0] },
    'Sala 2': { label: 'Sala 2', color: pieColors[1] },
    'Sala 3': { label: 'Sala 3', color: pieColors[2] },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="animate-fade-in-up shadow-sm" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-display text-primary">Ocupação Diária (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ occupancy: { label: 'Ocupação', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full aspect-auto"
          >
            <LineChart data={lineData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="var(--color-occupancy)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up shadow-sm" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-display text-primary">Distribuição por Sala</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="h-[300px] w-full aspect-auto">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
