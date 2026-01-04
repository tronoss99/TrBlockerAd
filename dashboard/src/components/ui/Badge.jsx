import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  secondary: 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80',
  destructive: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
  success: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
  outline: 'text-foreground border-input hover:bg-accent'
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
