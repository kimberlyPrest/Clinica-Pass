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
import { MoreVertical, ChevronDown } from 'lucide-react'

const PIE_COLORS = ['#05807f', '#77d6d4', '#f0dfd5']

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
      acc[entry.name] = { label: entry.name, color: PIE_COLORS[i % PIE_COLORS.length] }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  const total = pieData.reduce((acc, curr) => acc + curr.value, 0)

  const cardBase =
    'bg-white rounded-xl border border-[#e6e8ea] shadow-[0_2px_4px_rgba(5,128,127,0.04)]'

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className={`lg:col-span-3 ${cardBase} p-6`}>
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
        <div className={`lg:col-span-2 ${cardBase} p-6`}>
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-40 w-40 rounded-full mx-auto mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Line Chart — 3/5 */}
      <div
        className={`lg:col-span-3 ${cardBase} flex flex-col animate-fade-in-up`}
        style={{ animationDelay: '400ms' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0dfd5]">
          <h3 className="text-lg font-bold text-[#191c1e] font-display">Ocupação Mensal</h3>
          <button className="flex items-center gap-1 text-sm font-semibold text-[#05807f] hover:text-[#006564] transition-colors">
            Este Mês
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Chart */}
        <div className="flex-1 px-2 py-4 min-h-[260px]">
          <ChartContainer
            config={{ occupancy: { label: 'Ocupação', color: '#05807f' } }}
            className="h-[260px] w-full"
          >
            <LineChart data={lineData} margin={{ top: 16, right: 16, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f7e6dc" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f7e6dc" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e6e8ea"
                opacity={0.8}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6e7979' }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="natural"
                dataKey="occupancy"
                stroke="#05807f"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 5, strokeWidth: 2, fill: 'white', stroke: '#05807f' }}
                activeDot={{ r: 7, strokeWidth: 0, fill: '#05807f' }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Pie Chart — 2/5 */}
      <div
        className={`lg:col-span-2 ${cardBase} flex flex-col animate-fade-in-up`}
        style={{ animationDelay: '500ms' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0dfd5]">
          <h3 className="text-lg font-bold text-[#191c1e] font-display">Distribuição por Sala</h3>
          <button className="text-[#6e7979] hover:text-[#3e4948] transition-colors p-1 rounded-md hover:bg-[#eceef0]">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-6">
          {/* Donut */}
          <div className="relative w-40 h-40">
            <ChartContainer config={pieConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={0}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            {/* Center total */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#05807f] font-display">{total}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-[#191c1e] font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-[#191c1e]">{entry.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
