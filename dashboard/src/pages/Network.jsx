import { Wifi, Server, Globe, Router } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../context/LanguageContext'

export function Network({ data }) {
  const { t } = useLanguage()
  const summary = data?.summary || {}

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('network.dnsServer')}</div>
                <div className="font-medium">Pi-hole</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('status.dnsPort')}</div>
                <div className="font-medium">53</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Wifi className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('network.devices')}</div>
                <div className="font-medium">{summary.unique_clients || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Router className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('network.gateway')}</div>
                <div className="font-medium">192.168.1.1</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('network.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">{t('network.subnet')}</span>
                <span className="font-mono">192.168.1.0/24</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">{t('network.gateway')}</span>
                <span className="font-mono">192.168.1.1</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">{t('network.dnsServer')}</span>
                <span className="font-mono">192.168.1.x (Pi-hole)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">{t('network.dhcp')}</span>
                <Badge variant="secondary">{t('network.dhcpEnabled')}</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">{t('settings.upstreamDns')}</span>
                <span className="font-mono">1.1.1.1, 8.8.8.8</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">{t('settings.dnssec')}</span>
                <Badge variant="success">{t('lists.enabled')}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">{t('network.activeConnections')}</span>
                <span>{summary.unique_clients || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">{t('status.apiStatus')}</span>
                <Badge variant="success">{t('status.online')}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
