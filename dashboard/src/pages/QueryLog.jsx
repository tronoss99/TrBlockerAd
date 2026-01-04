import { useState, useMemo } from 'react'
import { Search, RefreshCw, CheckCircle, XCircle, Clock, ArrowRight, Download, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { Skeleton } from '../components/ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'
import { useQueryLog } from '../hooks/usePihole'

const STATUS_CONFIG = {
  blocked: { variant: 'destructive', icon: XCircle, color: 'text-red-500' },
  allowed: { variant: 'success', icon: CheckCircle, color: 'text-green-500' },
  cached: { variant: 'info', icon: Clock, color: 'text-blue-500' },
  forwarded: { variant: 'secondary', icon: ArrowRight, color: 'text-gray-500' },
  // Pi-hole v6 status codes
  GRAVITY: { variant: 'destructive', icon: XCircle, color: 'text-red-500', label: 'blocked' },
  FORWARDED: { variant: 'success', icon: ArrowRight, color: 'text-green-500', label: 'forwarded' },
  CACHE: { variant: 'info', icon: Clock, color: 'text-blue-500', label: 'cached' },
  REGEX: { variant: 'destructive', icon: XCircle, color: 'text-red-500', label: 'blocked' },
  DENYLIST: { variant: 'destructive', icon: XCircle, color: 'text-red-500', label: 'blocked' },
  EXTERNAL_BLOCKED: { variant: 'destructive', icon: XCircle, color: 'text-red-500', label: 'blocked' },
  ALLOWLIST: { variant: 'success', icon: CheckCircle, color: 'text-green-500', label: 'allowed' }
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  
  // Handle different timestamp formats
  let date
  if (typeof timestamp === 'number') {
    // Unix timestamp (seconds or milliseconds)
    date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else {
    return '-'
  }
  
  if (isNaN(date.getTime())) return '-'
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

function getStatusConfig(status) {
  if (!status) return STATUS_CONFIG.allowed
  const upperStatus = String(status).toUpperCase()
  return STATUS_CONFIG[upperStatus] || STATUS_CONFIG[status] || STATUS_CONFIG.allowed
}

export function QueryLog() {
  const { t } = useLanguage()
  const { queries, loading, error, refresh } = useQueryLog(200)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filterOptions = [
    { value: 'all', label: t('queryLog.filter') },
    { value: 'blocked', label: t('queryLog.blocked') },
    { value: 'allowed', label: t('queryLog.allowed') },
    { value: 'cached', label: t('queryLog.cached') },
    { value: 'forwarded', label: t('queryLog.forwarded') }
  ]

  const filtered = useMemo(() => {
    let result = queries
    
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(q =>
        q.domain?.toLowerCase().includes(term) ||
        q.client?.toLowerCase().includes(term) ||
        q.type?.toLowerCase().includes(term)
      )
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(q => {
        const status = String(q.status).toLowerCase()
        if (statusFilter === 'blocked') {
          return status.includes('block') || status.includes('gravity') || status.includes('deny') || status.includes('regex')
        }
        if (statusFilter === 'allowed') {
          return status.includes('allow') || status === 'forwarded' || status === 'cache'
        }
        if (statusFilter === 'cached') {
          return status.includes('cache')
        }
        if (statusFilter === 'forwarded') {
          return status.includes('forward')
        }
        return true
      })
    }
    
    return result
  }, [queries, search, statusFilter])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setIsRefreshing(false)
  }

  const exportData = () => {
    const csv = filtered.map(q => 
      `${formatTime(q.timestamp)},${q.type},${q.domain},${q.client},${q.status}`
    ).join('\n')
    const blob = new Blob([`Time,Type,Domain,Client,Status\n${csv}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl">{t('queryLog.title')}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('queryLog.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={filterOptions}
            className="w-36"
          />
          <Button variant="outline" size="icon" onClick={exportData} title={t('queryLog.export')}>
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            title={t('queryLog.refresh')}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center gap-2 py-8 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('status.error')}: {error}</span>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('queryLog.time')}</TableHead>
                  <TableHead>{t('queryLog.type')}</TableHead>
                  <TableHead>{t('queryLog.domain')}</TableHead>
                  <TableHead>{t('queryLog.client')}</TableHead>
                  <TableHead>{t('queryLog.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {t('queryLog.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((query, i) => {
                    const statusConfig = getStatusConfig(query.status)
                    const StatusIcon = statusConfig.icon
                    const statusLabel = statusConfig.label || query.status
                    
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {formatTime(query.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {query.type || 'A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[300px] truncate">
                          {query.domain || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {query.client || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {t(`queryLog.${statusLabel}`) || statusLabel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {!loading && !error && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t('queryLog.showing') || 'Showing'} {filtered.length} {t('queryLog.of') || 'of'} {queries.length} {t('queryLog.queries') || 'queries'}
            </span>
            <span>
              {t('status.lastUpdate')}: {new Date().toLocaleTimeString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
