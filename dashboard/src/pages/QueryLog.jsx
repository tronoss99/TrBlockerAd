import { useState, useMemo } from 'react'
import { Search, RefreshCw, CheckCircle, XCircle, Clock, ArrowRight, Download, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../context/LanguageContext'
import { useQueryLog } from '../hooks/usePihole'

const STATUS_MAP = {
  1: { key: 'blocked', variant: 'destructive', icon: XCircle },
  2: { key: 'allowed', variant: 'success', icon: CheckCircle },
  3: { key: 'cached', variant: 'default', icon: Clock },
  4: { key: 'forwarded', variant: 'secondary', icon: ArrowRight }
}

export function QueryLog() {
  const { t } = useLanguage()
  const { queries, loading, refresh } = useQueryLog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = queries
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(q =>
        q[2]?.toLowerCase().includes(term) ||
        q[3]?.toLowerCase().includes(term) ||
        q[1]?.toLowerCase().includes(term)
      )
    }
    if (statusFilter !== 'all') {
      const statusCode = { blocked: 1, allowed: 2, cached: 3, forwarded: 4 }[statusFilter]
      result = result.filter(q => q[4] === statusCode)
    }
    return result
  }, [queries, search, statusFilter])

  const exportData = () => {
    const csv = filtered.map(q => `${new Date(q[0] * 1000).toISOString()},${q[1]},${q[2]},${q[3]},${q[4]}`).join('\n')
    const blob = new Blob([`Time,Type,Domain,Client,Status\n${csv}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query-log.csv'
    a.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">{t('queryLog.title')}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('queryLog.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-8"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">{t('queryLog.filter')}</option>
            <option value="blocked">{t('queryLog.blocked')}</option>
            <option value="allowed">{t('queryLog.allowed')}</option>
            <option value="cached">{t('queryLog.cached')}</option>
            <option value="forwarded">{t('queryLog.forwarded')}</option>
          </select>
          <Button variant="outline" size="icon" onClick={exportData} title={t('queryLog.export')}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={refresh} title={t('queryLog.refresh')}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">{t('queryLog.time')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('queryLog.type')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('queryLog.domain')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('queryLog.client')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('queryLog.status')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t('status.loading')}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t('queryLog.noResults')}
                  </td>
                </tr>
              ) : (
                filtered.map((query, i) => {
                  const status = STATUS_MAP[query[4]] || STATUS_MAP[2]
                  const Icon = status.icon
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(query[0] * 1000).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{query[1]}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{query[2]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{query[3]}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {t(`queryLog.${status.key}`)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
