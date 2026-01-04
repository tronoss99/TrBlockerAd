import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { cn } from '../lib/utils'

export function StatCard({ title, value, icon: Icon, trend, loading, className, valueClassName }) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className={cn('text-2xl font-bold', valueClassName)}>{value}</span>
            {trend !== undefined && (
              <span className={cn('text-xs', trend >= 0 ? 'text-green-500' : 'text-red-500')}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
