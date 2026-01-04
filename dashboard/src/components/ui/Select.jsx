import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_8px_center] bg-no-repeat',
        '[&>option]:bg-card [&>option]:text-foreground [&>option]:py-2',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function SelectNative({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm transition-colors cursor-pointer',
          'hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&>option]:bg-popover [&>option]:text-popover-foreground',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
