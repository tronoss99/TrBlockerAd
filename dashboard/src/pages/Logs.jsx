import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Select'
import { useLanguage } from '../context/LanguageContext'
import { cn } from '../lib/utils'

export function Logs() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' }
  ]

  const [logs, setLogs] = useState([
    { time: new Date().toISOString(), level: 'info', message: 'DNS service started successfully' },
    { time: new Date(Date.now() - 60000).toISOString(), level: 'info', message: 'Gravity database updated' },
    { time: new Date(Date.now() - 120000).toISOString(), level: 'warning', message: 'High query rate detected from 192.168.1.105' },
    { time: new Date(Date.now() - 180000).toISOString(), level: 'info', message: 'Cache flushed' },
    { time: new Date(Date.now() - 240000).toISOString(), level: 'info', message: 'Blocked 2341 queries from ads.google.com' },
    { time: new Date(Date.now() - 300000).toISOString(), level: 'error', message: 'Upstream DNS 8.8.8.8 timeout' },
    { time: new Date(Date.now() - 360000).toISOString(), level: 'info', message: 'Switched to backup DNS 1.1.1.1' },
    { time: new Date(Date.now() - 420000).toISOString(), level: 'info', message: 'New client connected: 192.168.1.150' },
    { time: new Date(Date.now() - 480000).toISOString(), level: 'warning', message: 'Rate limit exceeded for client 192.168.1.42' },
    { time: new Date(Date.now() - 540000).toISOString(), level: 'info', message: 'DNSSEC validation successful' }
  ])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLogs(prev => [
        { time: new Date().toISOString(), level: 'info', message: 'Logs refreshed' },
        ...prev
      ])
      setIsRefreshing(false)
    }, 500)
  }

  const handleClear = () => {
    if (confirm(t('messages.confirmDelete'))) {
      setLogs([])
    }
  }

  const handleDownload = () => {
    const content = logs.map(l => 
      `[${new Date(l.time).toLocaleString()}] [${l.level.toUpperCase()}] ${l.message}`
    ).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pihole-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(l => l.level === filter)

  const getLevelConfig = (level) => {
    const configs = {
      info: { variant: 'info', icon: Info, color: 'text-blue-500' },
      warning: { variant: 'warning', icon: AlertCircle, color: 'text-yellow-500' },
      error: { variant: 'destructive', icon: AlertCircle, color: 'text-red-500' },
      success: { variant: 'success', icon: CheckCircle, color: 'text-green-500' }
    }
    return configs[level] || configs.info
  }

  const stats = {
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Logs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.info}</div>
                <div className="text-sm text-muted-foreground">Info</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.warning}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.error}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">{t('system.logs')}</CardTitle>
            <CardDescription>
              System and DNS logs
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={filterOptions}
              className="w-32"
            />
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t('system.downloadLogs')}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t('system.clearLogs')}</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No logs to display</p>
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/30 p-4 font-mono text-sm max-h-[600px] overflow-y-auto space-y-1">
              {filteredLogs.map((log, i) => {
                const config = getLevelConfig(log.level)
                const Icon = config.icon
                
                return (
                  <div 
                    key={i} 
                    className={cn(
                      'flex items-start gap-3 py-2 px-2 rounded-lg transition-colors hover:bg-muted/50',
                      log.level === 'error' && 'bg-red-500/5',
                      log.level === 'warning' && 'bg-yellow-500/5'
                    )}
                  >
                    <span className="text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(log.time).toLocaleTimeString()}
                    </span>
                    <Badge variant={config.variant} className="uppercase text-[10px] shrink-0">
                      <Icon className="h-3 w-3 mr-1" />
                      {log.level}
                    </Badge>
                    <span className={cn(
                      'flex-1',
                      log.level === 'error' && 'text-red-500',
                      log.level === 'warning' && 'text-yellow-500'
                    )}>
                      {log.message}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
