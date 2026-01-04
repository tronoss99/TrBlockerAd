import { useMemo } from 'react'
import { Users, Activity, Ban, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'
import { formatNumber } from '../lib/utils'
import { useState } from 'react'

export function Clients({ data, loading }) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')

  const clients = useMemo(() => {
    if (!data?.clients?.top_sources) return []
    return Object.entries(data.clients.top_sources).map(([client, queries]) => {
      const [ip, name] = client.split('|')
      return { 
        ip, 
        name: name || ip, 
        queries, 
        blocked: Math.floor(queries * (data?.summary?.ads_percentage_today || 15) / 100)
      }
    }).sort((a, b) => b.queries - a.queries)
  }, [data])

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ip.toLowerCase().includes(search.toLowerCase())
  )

  const totalQueries = clients.reduce((sum, c) => sum + c.queries, 0)
  const totalBlocked = clients.reduce((sum, c) => sum + c.blocked, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{clients.length}</div>
                <div className="text-sm text-muted-foreground">{t('clients.activeClients')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatNumber(totalQueries)}</div>
                <div className="text-sm text-muted-foreground">{t('clients.totalQueries')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <Ban className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{formatNumber(totalBlocked)}</div>
                <div className="text-sm text-muted-foreground">{t('clients.blockedQueries')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">{t('clients.title')}</CardTitle>
            <CardDescription>
              {t('clients.activeClients')} - {clients.length} {t('network.devices')}
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('actions.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {search ? t('queryLog.noResults') : t('clients.noClients')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{client.name}</span>
                      {client.name !== client.ip && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {client.ip}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{t('clients.queries')}: {formatNumber(client.queries)}</span>
                        <span className="text-red-500">{t('clients.blocked')}: {formatNumber(client.blocked)}</span>
                      </div>
                      <Progress 
                        value={(client.queries / (totalQueries || 1)) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {((client.queries / (totalQueries || 1)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('stats.blockRate')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
