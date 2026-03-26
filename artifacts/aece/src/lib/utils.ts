import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDecisionColors(decision: string | null | undefined) {
  switch (decision) {
    case 'APPROVED':
      return { text: 'text-aece-approved', bg: 'bg-aece-approved/10', border: 'border-aece-approved/50', shadow: 'shadow-aece-approved/20', hex: '#00ff88' }
    case 'CONDITIONAL':
      return { text: 'text-aece-conditional', bg: 'bg-aece-conditional/10', border: 'border-aece-conditional/50', shadow: 'shadow-aece-conditional/20', hex: '#00d4ff' }
    case 'FLAGGED':
      return { text: 'text-aece-flagged', bg: 'bg-aece-flagged/10', border: 'border-aece-flagged/50', shadow: 'shadow-aece-flagged/20', hex: '#ff8800' }
    case 'BLOCKED':
      return { text: 'text-aece-blocked', bg: 'bg-aece-blocked/10', border: 'border-aece-blocked/50', shadow: 'shadow-aece-blocked/40', hex: '#ff0044' }
    default:
      return { text: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-muted/50', shadow: 'shadow-none', hex: '#888888' }
  }
}
