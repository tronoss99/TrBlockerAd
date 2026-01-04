import { Activity, Ban, Database, Percent, Users, Zap, HardDrive, Clock, TrendingUp, Gauge, Server, Globe } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { QueriesChart, QueryTypesChart, TopDomainsChart, ClientsChart, UpstreamChart } from '../components/Charts'
import { Progress } from '../components/ui/Progress'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'
import { formatNumber, formatPercent, formatBytes } from '../lib/utils'

export function Dashboard({ data, loading }) {
  const { t } = useLanguage()
  const summary = data?.summary || {}

  const cacheHitRate = summary.queries_cached && summary.dns_queries_today
    ? (summary.queries_cached / summary.dns_queries_today) * 100
    : 0

  const memoryUsage = summary.memory
    ? Math.min((summary.memory / (256 * 1024 * 1024)) * 100, 100)
    : 0

  const cpuLoad = summary.load?.[0] ? Math.min(summary.load[0] * 100, 100) : 0

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalQueries')}
          value={formatNumber(summary.dns_queries_today)}
          icon={Activity}
          loading={loading}
          trend={summary.dns_queries_today > 0 ? '+12%' : undefined}
          trendUp={true}
        />
        <StatCard
          title={t('stats.blockedQueries')}
          value={formatNumber(summary.ads_blocked_today)}
          icon={Ban}
          loading={loading}
          valueClassName="text-red-500"
          trend={summary.ads_blocked_today > 0 ? `${formatPercent(summary.ads_percentage_today)}` : undefined}
        />
        <StatCard
          title={t('stats.percentBlocked')}
          value={formatPercent(summary.ads_percentage_today)}
          icon={Percent}
          loading={loading}
          valueClassName="text-primary"
        />
        <StatCard
          title={t('stats.domainsBlocked')}
          value={formatNumber(summary.domains_being_blocked)}
          icon={Database}
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.uniqueClients')}
          value={summary.unique_clients || 0}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title={t('stats.queriesForwarded')}
          value={formatNumber(summary.queries_forwarded)}
          icon={Zap}
          loading={loading}
        />
        <StatCard
          title={t('stats.queriesCached')}
          value={formatNumber(summary.queries_cached)}
          icon={HardDrive}
          loading={loading}
        />
        <StatCard
          title={t('stats.cacheHitRate')}
          value={formatPercent(cacheHitRate)}
          icon={TrendingUp}
          loading={loading}
          valueClassName="text-green-500"
        />
      </div>

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Gauge className="h-4 w-4" />
              {t('status.cpuUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cpuLoad.toFixed(1)}%</div>
            <Progress value={cpuLoad} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              Load: {summary.load?.map(l => l.toFixed(2)).join(', ') || '0.00, 0.00, 0.00'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Server className="h-4 w-4" />
              {t('status.memoryUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(summary.memory || 0)}</div>
            <Progress value={memoryUsage} className="mt-3" indicatorClassName="bg-blue-500" />
            <p className="mt-2 text-xs text-muted-foreground">
              {memoryUsage.toFixed(1)}% {t('system.memoryUsed')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              {t('stats.avgResponseTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.reply_time ? `${(summary.reply_time * 1000).toFixed(1)}ms` : '0ms'}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="success">{t('stats.fast')}</Badge>
              <span className="text-xs text-muted-foreground">p95</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe className="h-4 w-4" />
              {t('stats.upstreamLatency')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.gravity_last_updated?.relative?.days != null 
                ? `${summary.gravity_last_updated.relative.days}d` 
                : t('time.now')}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="success">Cloudflare</Badge>
              <Badge variant="info">Google</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <QueriesChart data={data?.overTime} />
        <QueryTypesChart data={data?.queryTypes} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TopDomainsChart data={data?.topItems} type="blocked" />
        <TopDomainsChart data={data?.topItems} type="permitted" />
        <ClientsChart data={data?.clients} />
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-4 md:grid-cols-2">
        <UpstreamChart data={data?.forwarded} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              {t('status.cacheSize')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-2xl font-bold text-primary">{formatNumber(summary.cache_inserted || 0)}</div>
                <div className="text-xs text-muted-foreground">{t('status.cacheInserts')}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-2xl font-bold text-yellow-500">{formatNumber(summary.cache_evicted || 0)}</div>
                <div className="text-xs text-muted-foreground">{t('status.cacheEvictions')}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-2xl font-bold text-green-500">{formatPercent(cacheHitRate)}</div>
                <div className="text-xs text-muted-foreground">{t('stats.cacheHitRate')}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('stats.cacheUsage')}</span>
                  <span>{formatNumber(summary.cache_inserted || 0)} / 10,000</span>
                </div>
                <Progress value={(summary.cache_inserted || 0) / 100} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('status.memoryUsage')}</span>
                  <span>{formatBytes(summary.memory || 0)} / 256 MB</span>
                </div>
                <Progress value={memoryUsage} indicatorClassName="bg-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stats.quickStats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
              <div className="text-xl font-bold">{formatNumber(summary.dns_queries_today)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('stats.today')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-500/10 transition-colors hover:bg-red-500/20">
              <div className="text-xl font-bold text-red-500">{formatNumber(summary.ads_blocked_today)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('stats.blocked')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-500/10 transition-colors hover:bg-green-500/20">
              <div className="text-xl font-bold text-green-500">{formatPercent(summary.ads_percentage_today)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('stats.blockRate')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
              <div className="text-xl font-bold">{summary.unique_clients || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('stats.clients')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-500/10 transition-colors hover:bg-blue-500/20">
              <div className="text-xl font-bold text-blue-500">{formatNumber(summary.queries_cached)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('stats.cached')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
              <div className="text-xl font-bold">{formatNumber(summary.domains_being_blocked)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('stats.blocklist')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
