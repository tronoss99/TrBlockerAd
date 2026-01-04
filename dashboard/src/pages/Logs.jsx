import { useState } from 'react'
import { FileText, Download, Trash2, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../context/LanguageContext'

export function Logs() {
  const { t } = useLanguage()
  const [logs] = useState([
    { time: new Date().toISOString(), level: 'info', message: 'DNS service started successfully' },
    { time: new Date(Date.now() - 60000).toISOString(), level: 'info', message: 'Gravity database updated' },
    { time: new Date(Date.now() - 120000).toISOString(), level: 'warning', message: 'High query rate detected from 192.168.1.105' },
    { time: new Date(Date.now() - 180000).toISOString(), level: 'info', message: 'Cache flushed' },
    { time: new Date(Date.now() - 240000).toISOString(), level: 'info', message: 'Blocked 2341 queries from ads.google.com' },
    { time: new Date(Date.now() - 300000).toISOString(), level: 'error', message: 'Upstream DNS 8.8.8.8 timeout' },
    { time: new Date(Date.now() - 360000).toISOString(), level: 'info', message: 'Switched to backup DNS 1.1.1.1' }
  ])

  const getLevelVariant = (level) => {
    const variants = { info: 'default', warning: 'warning', error: 'destructive' }
    return variants[level] || 'secondary'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">{t('system.logs')}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('system.downloadLogs')}
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            {t('system.clearLogs')}
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-muted/30 p-4 font-mono text-sm max-h-[600px] overflow-y-auto space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 py-1">
              <span className="text-muted-foreground whitespace-nowrap">
                {new Date(log.time).toLocaleTimeString()}
              </span>
              <Badge variant={getLevelVariant(log.level)} className="uppercase text-[10px]">
                {log.level}
              </Badge>
              <span className={log.level === 'error' ? 'text-red-500' : log.level === 'warning' ? 'text-yellow-500' : ''}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
