import { useState } from 'react'
import { Server, Cpu, HardDrive, Activity, RefreshCw, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { Skeleton } from '../components/ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'
import { useSystemInfo, restartDns, flushCache } from '../hooks/usePihole'
import { formatBytes, cn } from '../lib/utils'

export function System({ data }) {
  const { t } = useLanguage()
  const { info, loading } = useSystemInfo()
  const summary = data?.summary || {}
  const [isRestarting, setIsRestarting] = useState(false)
  const [isFlushing, setIsFlushing] = useState(false)

  const handleRestartDns = async () => {
    if (confirm(t('messages.confirmDelete'))) {
      setIsRestarting(true)
      try {
        await restartDns()
      } catch (err) {
        console.error('Restart failed:', err)
      } finally {
        setIsRestarting(false)
      }
    }
  }

  const handleFlushCache = async () => {
    setIsFlushing(true)
    try {
      await flushCache()
    } catch (err) {
      console.error('Flush failed:', err)
    } finally {
      setIsFlushing(false)
    }
  }

  const cpuLoad = summary.load?.[0] ? Math.min(summary.load[0] * 100, 100) : 0
  const memoryUsage = summary.memory ? Math.min((summary.memory / (256 * 1024 * 1024)) * 100, 100) : 0

  const services = [
    { name: 'Pi-hole FTL', status: 'running', key: 'ftl' },
    { name: 'DNS Resolver', status: 'running', key: 'dns' },
    { name: 'Web Interface', status: 'running', key: 'web' }
  ]

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">{t('status.cpuUsage')}</div>
                <div className="text-2xl font-bold">{cpuLoad.toFixed(1)}%</div>
              </div>
            </div>
            <Progress value={cpuLoad} className="mt-4" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Server className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">{t('status.memoryUsage')}</div>
                <div className="text-2xl font-bold">{formatBytes(summary.memory || 0)}</div>
              </div>
            </div>
            <Progress value={memoryUsage} className="mt-4" indicatorClassName="bg-blue-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <HardDrive className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">{t('status.cacheSize')}</div>
                <div className="text-2xl font-bold">{summary.cache_inserted || 0}</div>
              </div>
            </div>
            <Progress value={(summary.cache_inserted || 0) / 100} className="mt-4" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                <Activity className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">{t('system.uptime')}</div>
                <div className="text-2xl font-bold">
                  {summary.gravity_last_updated?.relative?.days != null 
                    ? `${summary.gravity_last_updated.relative.days}d` 
                    : '0d'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services & Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('system.services')}
            </CardTitle>
            <CardDescription>
              {t('system.serviceStatus')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.key} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    service.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <Badge variant={service.status === 'running' ? 'success' : 'destructive'}>
                  {service.status === 'running' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('system.running')}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {t('system.stopped')}
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('system.title')}</CardTitle>
            <CardDescription>
              Version and system information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Pi-hole Core</span>
                  <span className="font-mono text-sm">{info?.version?.core || 'v6.x'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">FTL</span>
                  <span className="font-mono text-sm">{info?.version?.ftl || 'v6.x'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">{t('status.databaseSize')}</span>
                  <span>{formatBytes(summary.database_size || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">{t('status.gravityStatus')}</span>
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('status.healthy')}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.advanced')}</CardTitle>
          <CardDescription>
            System maintenance actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleRestartDns} disabled={isRestarting}>
              <RefreshCw className={cn('h-4 w-4', isRestarting && 'animate-spin')} />
              <span className="ml-2">{t('settings.restartDns')}</span>
            </Button>
            <Button variant="outline" onClick={handleFlushCache} disabled={isFlushing}>
              <HardDrive className={cn('h-4 w-4', isFlushing && 'animate-spin')} />
              <span className="ml-2">{t('settings.flushCache')}</span>
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4" />
              <span className="ml-2">{t('system.viewLogs')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
