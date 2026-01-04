import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { cn } from '../lib/utils'

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  loading, 
  valueClassName,
  trend,
  trendUp,
  description 
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className={cn('text-2xl font-bold tracking-tight', valueClassName)}>
                  {value}
                </p>
                {trend && (
                  <span className={cn(
                    'flex items-center text-xs font-medium',
                    trendUp ? 'text-green-500' : 'text-red-500'
                  )}>
                    {trendUp ? (
                      <TrendingUp className="mr-0.5 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-0.5 h-3 w-3" />
                    )}
                    {trend}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
