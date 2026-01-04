import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
