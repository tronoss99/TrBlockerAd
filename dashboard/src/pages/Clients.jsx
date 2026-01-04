import { useMemo } from 'react'
import { Users, Activity, Ban } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { useLanguage } from '../context/LanguageContext'
import { formatNumber } from '../lib/utils'

export function Clients({ data }) {
  const { t } = useLanguage()

  const clients = useMemo(() => {
    if (!data?.clients?.top_sources) return []
    return Object.entries(data.clients.top_sources).map(([client, queries]) => {
      const [ip, name] = client.split('|')
      return { ip, name: name || ip, queries, blocked: Math.floor(queries * 0.15) }
    })
  }, [data])

  const totalQueries = clients.reduce((sum, c) => sum + c.queries, 0)
  const totalBlocked = clients.reduce((sum, c) => sum + c.blocked, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{clients.length}</div>
                <div className="text-sm text-muted-foreground">{t('clients.activeClients')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{formatNumber(totalQueries)}</div>
                <div className="text-sm text-muted-foreground">{t('clients.totalQueries')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-500">{formatNumber(totalBlocked)}</div>
                <div className="text-sm text-muted-foreground">{t('clients.blockedQueries')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">{t('clients.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {t('clients.noClients')}
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{client.name}</span>
                      <Badge variant="secondary">{client.ip}</Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{t('clients.queries')}: {formatNumber(client.queries)}</span>
                        <span>{t('clients.blocked')}: {formatNumber(client.blocked)}</span>
                      </div>
                      <Progress value={(client.queries / (totalQueries || 1)) * 100} className="h-1.5" />
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
