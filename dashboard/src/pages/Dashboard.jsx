import { Activity, Ban, Database, Percent, Users, Zap, HardDrive, Clock, TrendingUp, Shield, Globe, Server, Gauge } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { QueriesChart, QueryTypesChart, TopDomainsChart, ClientsChart, UpstreamChart } from '../components/Charts'
import { Progress } from '../components/ui/Progress'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../context/LanguageContext'
import { formatNumber, formatPercent, formatBytes } from '../lib/utils'

export function Dashboard({ data, loading }) {
  const { t } = useLanguage()
  const summary = data?.summary || {}

  const cacheHitRate = summary.queries_cached && summary.dns_queries_today
    ? (summary.queries_cached / summary.dns_queries_today) * 100
    : 0

  const memoryUsage = summary.memory
    ? (summary.memory / (256 * 1024 * 1024)) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalQueries')}
          value={formatNumber(summary.dns_queries_today)}
          icon={Activity}
          loading={loading}
        />
        <StatCard
          title={t('stats.blockedQueries')}
          value={formatNumber(summary.ads_blocked_today)}
          icon={Ban}
          loading={loading}
          valueClassName="text-red-500"
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              {t('status.cpuUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.load ? `${(summary.load[0] * 100).toFixed(1)}%` : '0%'}</div>
            <Progress value={summary.load ? summary.load[0] * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              {t('status.memoryUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(summary.memory || 0)}</div>
            <Progress value={memoryUsage} className="mt-2" indicatorClassName="bg-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('stats.avgResponseTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.reply_time ? `${summary.reply_time.toFixed(1)}ms` : '0ms'}</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="success">{t('stats.fast')}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('stats.upstreamLatency')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.gravity_last_updated ? `${summary.gravity_last_updated.relative?.days || 0}d` : '0ms'}</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="success">Cloudflare</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <QueriesChart data={data?.overTime} />
        <QueryTypesChart data={data?.queryTypes} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TopDomainsChart data={data?.topItems} type="blocked" />
        <TopDomainsChart data={data?.topItems} type="permitted" />
        <ClientsChart data={data?.clients} />
      </div>

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
              <div>
                <div className="text-2xl font-bold text-primary">{formatNumber(summary.cache_inserted || 0)}</div>
                <div className="text-xs text-muted-foreground">{t('status.cacheInserts')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{formatNumber(summary.cache_evicted || 0)}</div>
                <div className="text-xs text-muted-foreground">{t('status.cacheEvictions')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatPercent(cacheHitRate)}</div>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('stats.quickStats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{formatNumber(summary.dns_queries_today)}</div>
              <div className="text-xs text-muted-foreground">{t('stats.today')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-red-500">{formatNumber(summary.ads_blocked_today)}</div>
              <div className="text-xs text-muted-foreground">{t('stats.blocked')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-green-500">{formatPercent(summary.ads_percentage_today)}</div>
              <div className="text-xs text-muted-foreground">{t('stats.blockRate')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{summary.unique_clients || 0}</div>
              <div className="text-xs text-muted-foreground">{t('stats.clients')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-blue-500">{formatNumber(summary.queries_cached)}</div>
              <div className="text-xs text-muted-foreground">{t('stats.cached')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{formatNumber(summary.domains_being_blocked)}</div>
              <div className="text-xs text-muted-foreground">{t('stats.blocklist')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
