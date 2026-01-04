import { Shield, ShieldOff, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { useLanguage } from '../context/LanguageContext'
import { cn } from '../lib/utils'

export function Header({ status, onToggle, onRefresh, lastUpdate, systemHealth }) {
  const { t } = useLanguage()
  const isEnabled = status === 'enabled'

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return t('time.now')
    const diff = Math.floor((Date.now() - timestamp) / 1000)
    if (diff < 60) return t('time.now')
    if (diff < 3600) return `${Math.floor(diff / 60)} ${t('time.minutes')}`
    return `${Math.floor(diff / 3600)} ${t('time.hours')}`
  }

  const healthConfig = {
    healthy: { variant: 'success', icon: CheckCircle, label: t('status.healthy') },
    warning: { variant: 'warning', icon: AlertCircle, label: t('status.warning') },
    critical: { variant: 'destructive', icon: AlertCircle, label: t('status.critical') }
  }

  const health = healthConfig[systemHealth] || healthConfig.healthy
  const HealthIcon = health.icon

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-4">
        <div className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300',
          isEnabled 
            ? 'bg-green-500/10 text-green-500' 
            : 'bg-red-500/10 text-red-500'
        )}>
          {isEnabled ? (
            <Shield className="h-5 w-5" />
          ) : (
            <ShieldOff className="h-5 w-5" />
          )}
          <span className="font-medium text-sm">
            {isEnabled ? t('status.enabled') : t('status.disabled')}
          </span>
        </div>
        
        <Badge variant={health.variant} className="gap-1.5">
          <HealthIcon className="h-3 w-3" />
          {health.label}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{t('status.lastUpdate')}: {formatLastUpdate(lastUpdate)}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('actions.refresh')}
        </Button>
        
        <Button
          variant={isEnabled ? 'destructive' : 'success'}
          size="sm"
          onClick={() => onToggle(!isEnabled)}
          className="gap-2"
        >
          {isEnabled ? (
            <>
              <ShieldOff className="h-4 w-4" />
              {t('status.disable')}
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              {t('status.enable')}
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
