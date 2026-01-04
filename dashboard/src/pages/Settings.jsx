import { useState } from 'react'
import { Save, RotateCcw, Shield, Database, Bell, Globe, Palette } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Switch } from '../components/ui/Switch'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { languageNames } from '../i18n'

export function Settings() {
  const { t, lang, setLang } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    refreshInterval: 5,
    dnssec: true,
    conditionalForwarding: false,
    queryLogging: true,
    privacyLevel: 0,
    blockingMode: 'null',
    cacheSize: 10000,
    minTtl: 300,
    maxTtl: 86400,
    logRetention: 365,
    rateLimit: 1000,
    upstreamDns: ['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'],
    localDomain: 'local',
    routerIp: '192.168.1.1'
  })

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateDns = (index, value) => {
    setSettings(prev => ({
      ...prev,
      upstreamDns: prev.upstreamDns.map((dns, i) => i === index ? value : dns)
    }))
  }

  const handleSave = () => {
    alert(t('messages.saved'))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('settings.interface')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.language')}</label>
            <Select value={lang} onChange={(e) => setLang(e.target.value)} className="w-40">
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.theme')}</label>
            <Select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-40">
              <option value="dark">{t('settings.dark')}</option>
              <option value="light">{t('settings.light')}</option>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.refreshInterval')}</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.refreshInterval}
                onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">{t('settings.seconds')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.dns')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settings.upstreamDns')}</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {settings.upstreamDns.map((dns, i) => (
                <Input
                  key={i}
                  value={dns}
                  onChange={(e) => updateDns(i, e.target.value)}
                  placeholder={`DNS ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('settings.dnssec')}</label>
              <p className="text-xs text-muted-foreground">{t('settings.dnssecDesc')}</p>
            </div>
            <Switch checked={settings.dnssec} onChange={(v) => updateSetting('dnssec', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('settings.conditionalForwarding')}</label>
              <p className="text-xs text-muted-foreground">{t('settings.conditionalForwardingDesc')}</p>
            </div>
            <Switch checked={settings.conditionalForwarding} onChange={(v) => updateSetting('conditionalForwarding', v)} />
          </div>
          {settings.conditionalForwarding && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm">{t('settings.router')}</label>
                <Input
                  value={settings.routerIp}
                  onChange={(e) => updateSetting('routerIp', e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm">{t('settings.domain')}</label>
                <Input
                  value={settings.localDomain}
                  onChange={(e) => updateSetting('localDomain', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('settings.blocking')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.blockingMode')}</label>
            <Select value={settings.blockingMode} onChange={(e) => updateSetting('blockingMode', e.target.value)} className="w-48">
              <option value="null">{t('settings.blockingModes.null')}</option>
              <option value="ip">{t('settings.blockingModes.ip')}</option>
              <option value="nxdomain">{t('settings.blockingModes.nxdomain')}</option>
              <option value="nodata">{t('settings.blockingModes.nodata')}</option>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('settings.rateLimit')}</label>
              <p className="text-xs text-muted-foreground">{t('settings.rateLimitDesc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.rateLimit}
                onChange={(e) => updateSetting('rateLimit', parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">{t('settings.queriesPerMinute')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('settings.cache')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.cacheSize')}</label>
              <Input
                type="number"
                value={settings.cacheSize}
                onChange={(e) => updateSetting('cacheSize', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.minTtl')}</label>
              <Input
                type="number"
                value={settings.minTtl}
                onChange={(e) => updateSetting('minTtl', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.maxTtl')}</label>
              <Input
                type="number"
                value={settings.maxTtl}
                onChange={(e) => updateSetting('maxTtl', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.negativeTtl')}</label>
              <Input type="number" defaultValue={3600} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('settings.logging')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('settings.queryLogging')}</label>
              <p className="text-xs text-muted-foreground">{t('settings.queryLoggingDesc')}</p>
            </div>
            <Switch checked={settings.queryLogging} onChange={(v) => updateSetting('queryLogging', v)} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.logRetention')}</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.logRetention}
                onChange={(e) => updateSetting('logRetention', parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{t('settings.days')}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.privacyLevel')}</label>
            <Select value={settings.privacyLevel} onChange={(e) => updateSetting('privacyLevel', parseInt(e.target.value))} className="w-48">
              <option value={0}>{t('settings.privacyLevels.showAll')}</option>
              <option value={1}>{t('settings.privacyLevels.hideClients')}</option>
              <option value={2}>{t('settings.privacyLevels.anonymous')}</option>
              <option value={3}>{t('settings.privacyLevels.disabled')}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          {t('settings.reset')}
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {t('settings.save')}
        </Button>
      </div>
    </div>
  )
}
