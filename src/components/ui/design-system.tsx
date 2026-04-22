/**
 * Design System — Clinica Pass
 * Tokens e componentes reutilizáveis compartilhados entre todas as páginas.
 * Baseado no design system do protótipo do dashboard.
 */

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ReactNode } from 'react'

// ─── COLOR TOKENS ──────────────────────────────────────────────────────────────
export const DS = {
  bg: '#f7f9fb',           // surface / page background
  card: '#ffffff',         // card background
  border: '#e6e8ea',       // card/table border
  borderSub: '#eceef0',    // row dividers
  primary: '#05807f',      // teal — main brand color
  primaryDark: '#006564',  // darker teal for text on light
  secondary: '#f0dfd5',    // peach — secondary container
  secondaryDim: '#d3c3ba', // peach darker (hover)
  tealLight: '#94f2f0',    // light teal (badge bg, avatar bg)
  textMain: '#191c1e',     // on-surface (headlines, bold text)
  textSub: '#3e4948',      // on-surface-variant (secondary text)
  textMuted: '#6e7979',    // outline (captions, labels)
  shadow: '0_2px_4px_rgba(5,128,127,0.04)',
} as const

// ─── PAGE WRAPPER ──────────────────────────────────────────────────────────────
export function PageWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 md:p-8 min-h-full bg-[#f7f9fb]', className)}>
      <div className="max-w-6xl mx-auto space-y-6">{children}</div>
    </div>
  )
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-down">
      <div>
        <h1 className="text-[32px] font-bold font-display leading-tight text-[#191c1e]">{title}</h1>
        {subtitle && <p className="text-sm text-[#6e7979] mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}

// ─── CARD ──────────────────────────────────────────────────────────────────────
export function DSCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-[#e6e8ea] shadow-[0_2px_4px_rgba(5,128,127,0.04)]',
        padded && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── CARD HEADER (with divider) ────────────────────────────────────────────────
export function DSCardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-[#e6e8ea] bg-[#f7f9fb] rounded-t-xl">
      <div>
        <h2 className="text-xl font-bold font-display text-[#191c1e]">{title}</h2>
        {subtitle && <p className="text-sm text-[#6e7979] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}

// ─── TABLE HEADER CELL ─────────────────────────────────────────────────────────
export function DSTableHead({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-[11px] font-semibold text-[#6e7979] uppercase tracking-widest text-left',
        className,
      )}
    >
      {children}
    </th>
  )
}

// ─── TABLE ROW ─────────────────────────────────────────────────────────────────
export function DSTableRow({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <tr
      className={cn(
        'group border-b border-[#eceef0] hover:bg-[#f2f4f6]/50 transition-colors animate-fade-in',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </tr>
  )
}

// ─── PRIMARY BUTTON ────────────────────────────────────────────────────────────
export function DSButtonPrimary({
  children,
  onClick,
  className,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 bg-[#05807f] hover:bg-[#006564] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200',
        className,
      )}
    >
      {children}
    </button>
  )
}

// ─── SECONDARY BUTTON ──────────────────────────────────────────────────────────
export function DSButtonSecondary({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 bg-[#f0dfd5] hover:bg-[#d3c3ba] text-[#05807f] border border-[#05807f]/20 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors duration-200',
        className,
      )}
    >
      {children}
    </button>
  )
}

// ─── BADGE ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'teal' | 'peach' | 'grey' | 'red' | 'yellow'

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  teal: 'bg-[#E6F2F2] text-[#05807f]',
  peach: 'bg-[#f0dfd5] text-[#006564]',
  grey: 'bg-[#e6e8ea] text-[#3e4948]',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-700',
}

export function DSBadge({
  children,
  variant = 'grey',
  className,
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        BADGE_VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── AVATAR INITIALS ───────────────────────────────────────────────────────────
export function DSAvatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cn(
        'w-8 h-8 rounded-full bg-[#94f2f0]/30 text-[#006564] flex items-center justify-center font-bold text-xs shrink-0 select-none',
        className,
      )}
    >
      {initials}
    </div>
  )
}

// ─── SEARCH INPUT ──────────────────────────────────────────────────────────────
export function DSSearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7979]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#e6e8ea] rounded-lg text-[#191c1e] placeholder:text-[#6e7979] focus:outline-none focus:ring-2 focus:ring-[#05807f]/30 focus:border-[#05807f] transition-all"
      />
    </div>
  )
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
export function DSEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <Icon className="w-12 h-12 text-[#6e7979] opacity-40 mb-4" />
      <h3 className="text-lg font-bold font-display text-[#191c1e] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#6e7979] max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ─── SKELETON ROWS ─────────────────────────────────────────────────────────────
export function DSSkeletonRows({ cols = 4, rows = 4 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-[#eceef0]">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full max-w-[160px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
