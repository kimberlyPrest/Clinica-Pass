/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add any other utility functions here

export function formatPhone(val: string) {
  let v = val.replace(/\D/g, '')
  v = v.slice(0, 11)
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`
  return v
}
