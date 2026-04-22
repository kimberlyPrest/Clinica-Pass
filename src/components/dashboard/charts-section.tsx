import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pieColors = ['#05807f', '#77d4d3', '#f0dfd5']

export function ChartsSection({
  lineData,
  pieData,
  loading,
}: {
  lineData: any[]
  pieData: any[]
  loading?: boolean
}) {
  const pieConfig = pieData.reduce(
    (acc, entry, i) => {
      acc[entry.name] = { label: entry.name, color: pieColors[i % pieColors.length] }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  const total = pieData.reduce((acc, curr) => acc + curr.value, 0)

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50 rounded-2xl">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50 rounded-2xl">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-48 w-48 rounded-full mx-auto mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card
        className="lg:col-span-2 animate-fade-in-up shadow-sm border-border/50 rounded-2xl"
        style={{ animationDelay: '400ms' }}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-display font-bold text-foreground">
            Ocupação Mensal
          </CardTitle>
          <div className="flex items-center text-sm font-bold text-accent bg-accent/10 px-4 py-1.5 rounded-full cursor-pointer hover:bg-accent/20 transition-colors">
            Este Mês <span className="ml-1 text-xs">▼</span>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer
            config={{ occupancy: { label: 'Ocupação', color: 'hsl(var(--accent))' } }}
            className="h-[300px] w-full"
          >
            <LineChart data={lineData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="natural"
                dataKey="occupancy"
                stroke="var(--color-occupancy)"
                strokeWidth={6}
                dot={{ r: 6, strokeWidth: 3, fill: 'white', stroke: 'var(--color-occupancy)' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--color-occupancy)' }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card
        className="animate-fade-in-up shadow-sm border-border/50 rounded-2xl"
        style={{ animationDelay: '500ms' }}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <CardTitle className="text-xl font-display font-bold text-foreground">
            Distribuição por Sala
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[320px]">
          <div className="relative w-48 h-48 mb-6">
            <ChartContainer config={pieConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-display font-bold text-accent">{total}</span>
            </div>
          </div>

          <div className="w-full space-y-3 px-4">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pieColors[i % pieColors.length] }}
                  />
                  <span className="font-medium text-foreground">{entry.name}</span>
                </div>
                <span className="font-bold text-foreground">{entry.percent}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
