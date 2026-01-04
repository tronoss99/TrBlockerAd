import { RefreshCw, Shield, ShieldOff, ShieldAlert, Clock, Wifi, WifiOff } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { useLanguage } from '../context/LanguageContext'
import { cn } from '../lib/utils'

export function Header({ status, onToggle, onRefresh, lastUpdate, systemHealth }) {
  const { t } = useLanguage()
  const enabled = status === 'enabled'

  const getHealthIcon = () => {
    if (systemHealth === 'healthy') return <Wifi className="h-3 w-3" />
    if (systemHealth === 'warning') return <ShieldAlert className="h-3 w-3" />
    return <WifiOff className="h-3 w-3" />
  }

  const getHealthVariant = () => {
    if (systemHealth === 'healthy') return 'success'
    if (systemHealth === 'warning') return 'warning'
    return 'destructive'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Badge variant={enabled ? 'success' : 'destructive'} className="gap-1.5 px-3 py-1">
          {enabled ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
          {enabled ? t('status.enabled') : t('status.disabled')}
        </Badge>
        <Badge variant={getHealthVariant()} className="gap-1.5">
          {getHealthIcon()}
          {t(`status.${systemHealth || 'healthy'}`)}
        </Badge>
        {lastUpdate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {t('status.lastUpdate')}: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('queryLog.refresh')}
        </Button>
        <Button
          variant={enabled ? 'destructive' : 'default'}
          size="sm"
          onClick={() => onToggle(!enabled)}
          className={cn('gap-2', !enabled && 'bg-green-600 hover:bg-green-700')}
        >
          {enabled ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          {enabled ? t('status.disable') : t('status.enable')}
        </Button>
      </div>
    </header>
  )
}
