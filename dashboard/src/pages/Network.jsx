import { Wifi, Server, Globe, Router, Shield, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../context/LanguageContext'

export function Network({ data }) {
  const { t } = useLanguage()
  const summary = data?.summary || {}

  const networkCards = [
    {
      icon: Server,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      label: t('network.dnsServer'),
      value: 'Pi-hole'
    },
    {
      icon: Globe,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: t('status.dnsPort'),
      value: '53'
    },
    {
      icon: Wifi,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: t('network.devices'),
      value: summary.unique_clients || 0
    },
    {
      icon: Router,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      label: t('network.gateway'),
      value: '192.168.1.1'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {networkCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{card.label}</div>
                  <div className="text-xl font-bold">{card.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('network.title')}
          </CardTitle>
          <CardDescription>
            Network configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('network.title')}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">{t('network.subnet')}</span>
                  <span className="font-mono text-sm">192.168.1.0/24</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">{t('network.gateway')}</span>
                  <span className="font-mono text-sm">192.168.1.1</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">{t('network.dnsServer')}</span>
                  <span className="font-mono text-sm">Pi-hole</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">{t('network.dhcp')}</span>
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('network.dhcpEnabled')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                DNS {t('settings.dns')}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">{t('settings.upstreamDns')}</span>
                  <span className="font-mono text-sm">1.1.1.1, 8.8.8.8</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">{t('settings.dnssec')}</span>
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('lists.enabled')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">{t('network.activeConnections')}</span>
                  <span className="font-bold">{summary.unique_clients || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">{t('status.apiStatus')}</span>
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('status.online')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DHCP Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('network.dhcp')}</CardTitle>
          <CardDescription>
            DHCP server configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">{t('network.dhcpRange')}</div>
              <div className="font-mono mt-1">192.168.1.100 - 192.168.1.200</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">{t('network.leases')}</div>
              <div className="font-bold text-xl mt-1">{summary.unique_clients || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
