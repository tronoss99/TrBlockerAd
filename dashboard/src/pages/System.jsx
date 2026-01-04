import { Server, Cpu, HardDrive, Activity, RefreshCw, Play, Square } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { useLanguage } from '../context/LanguageContext'
import { useSystemInfo, restartDns, flushCache } from '../hooks/usePihole'
import { formatBytes } from '../lib/utils'

export function System({ data }) {
  const { t } = useLanguage()
  const { info } = useSystemInfo()
  const summary = data?.summary || {}

  const handleRestartDns = async () => {
    if (confirm(t('messages.confirmDelete'))) {
      await restartDns()
    }
  }

  const handleFlushCache = async () => {
    await flushCache()
  }

  const services = [
    { name: 'Pi-hole FTL', status: 'running', key: 'ftl' },
    { name: 'Dnsmasq', status: 'running', key: 'dnsmasq' },
    { name: 'DNS Service', status: 'running', key: 'dns' }
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Cpu className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">{t('status.cpuUsage')}</div>
                <div className="text-2xl font-bold">{summary.load ? `${(summary.load[0] * 100).toFixed(1)}%` : '0%'}</div>
              </div>
            </div>
            <Progress value={summary.load ? summary.load[0] * 100 : 0} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">{t('status.memoryUsage')}</div>
                <div className="text-2xl font-bold">{formatBytes(summary.memory || 0)}</div>
              </div>
            </div>
            <Progress value={(summary.memory || 0) / (256 * 1024 * 1024) * 100} className="mt-3" indicatorClassName="bg-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">{t('status.cacheSize')}</div>
                <div className="text-2xl font-bold">{summary.cache_inserted || 0}</div>
              </div>
            </div>
            <Progress value={(summary.cache_inserted || 0) / 100} className="mt-3" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">{t('system.uptime')}</div>
                <div className="text-2xl font-bold">{summary.gravity_last_updated?.relative?.days || 0}d</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('system.services')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.key} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${service.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{service.name}</span>
                </div>
                <Badge variant={service.status === 'running' ? 'success' : 'destructive'}>
                  {service.status === 'running' ? t('system.running') : t('system.stopped')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('system.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t('status.version')}</span>
              <span className="font-mono">{info?.version?.core_current || 'v5.x'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">FTL</span>
              <span className="font-mono">{info?.version?.FTL_current || 'v5.x'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t('status.databaseSize')}</span>
              <span>{formatBytes(summary.database_size || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">{t('status.gravityStatus')}</span>
              <Badge variant="success">{t('status.healthy')}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.advanced')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleRestartDns}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('settings.restartDns')}
            </Button>
            <Button variant="outline" onClick={handleFlushCache}>
              <HardDrive className="mr-2 h-4 w-4" />
              {t('settings.flushCache')}
            </Button>
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              {t('system.viewLogs')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
