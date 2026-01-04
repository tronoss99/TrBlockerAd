import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, ExternalLink, Check, X, ListChecks, Database, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Switch } from '../components/ui/Switch'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'
import { useLists, runGravityUpdate } from '../hooks/usePihole'
import { cn, formatNumber } from '../lib/utils'

const DEFAULT_LISTS = [
  { url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts', enabled: true, domains: 180000, category: 'ads' },
  { url: 'https://v.firebog.net/hosts/AdguardDNS.txt', enabled: true, domains: 45000, category: 'ads' },
  { url: 'https://v.firebog.net/hosts/Easylist.txt', enabled: true, domains: 32000, category: 'ads' },
  { url: 'https://v.firebog.net/hosts/Easyprivacy.txt', enabled: true, domains: 15000, category: 'tracking' },
  { url: 'https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt', enabled: true, domains: 48000, category: 'ads' },
  { url: 'https://phishing.army/download/phishing_army_blocklist_extended.txt', enabled: true, domains: 12000, category: 'phishing' },
  { url: 'https://v.firebog.net/hosts/Prigent-Crypto.txt', enabled: true, domains: 8000, category: 'crypto' },
  { url: 'https://raw.githubusercontent.com/crazy-max/WindowsSpyBlocker/master/data/hosts/spy.txt', enabled: true, domains: 3500, category: 'tracking' }
]

export function Lists() {
  const { t } = useLanguage()
  const { lists: apiLists, loading: apiLoading, addList: apiAddList, removeList: apiRemoveList, toggleList: apiToggleList, refresh } = useLists()
  const [lists, setLists] = useState(DEFAULT_LISTS)
  const [showAdd, setShowAdd] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newCategory, setNewCategory] = useState('custom')
  const [updating, setUpdating] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Use API lists if available, otherwise use defaults
  useEffect(() => {
    if (apiLists && apiLists.length > 0) {
      setLists(apiLists.map(l => ({
        id: l.id,
        url: l.address || l.url,
        enabled: l.enabled !== false,
        domains: l.number || 0,
        category: l.comment?.includes('tracking') ? 'tracking' : 
                  l.comment?.includes('malware') ? 'malware' :
                  l.comment?.includes('phishing') ? 'phishing' : 'ads'
      })))
    }
  }, [apiLists])

  const toggleList = async (index) => {
    const list = lists[index]
    if (list.id) {
      await apiToggleList(list.id, !list.enabled)
    } else {
      setLists(prev => prev.map((l, i) =>
        i === index ? { ...l, enabled: !l.enabled } : l
      ))
    }
  }

  const removeList = async (index) => {
    if (confirm(t('lists.confirmRemove'))) {
      const list = lists[index]
      if (list.id) {
        await apiRemoveList(list.id)
      } else {
        setLists(prev => prev.filter((_, i) => i !== index))
      }
    }
  }

  const addList = async () => {
    if (newUrl.trim()) {
      setIsAdding(true)
      const success = await apiAddList(newUrl.trim(), newCategory)
      if (success) {
        setNewUrl('')
        setNewCategory('custom')
        setShowAdd(false)
      } else {
        // Fallback to local state
        setLists(prev => [...prev, { url: newUrl.trim(), enabled: true, domains: 0, category: newCategory }])
        setNewUrl('')
        setNewCategory('custom')
        setShowAdd(false)
      }
      setIsAdding(false)
    }
  }

  const handleGravityUpdate = async () => {
    setUpdating(true)
    try {
      await runGravityUpdate()
      await refresh()
    } catch (err) {
      console.error('Gravity update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  const totalDomains = lists.filter(l => l.enabled).reduce((sum, l) => sum + (l.domains || 0), 0)
  const activeLists = lists.filter(l => l.enabled).length

  const getCategoryConfig = (cat) => {
    const configs = {
      ads: { variant: 'destructive', label: t('lists.ads') },
      tracking: { variant: 'warning', label: t('lists.tracking') },
      malware: { variant: 'destructive', label: t('lists.malware') },
      phishing: { variant: 'destructive', label: t('lists.phishing') },
      crypto: { variant: 'warning', label: t('lists.crypto') },
      social: { variant: 'info', label: t('lists.social') },
      custom: { variant: 'secondary', label: t('lists.custom') }
    }
    return configs[cat] || configs.custom
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ListChecks className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeLists}</div>
                <div className="text-sm text-muted-foreground">{t('lists.activeLists')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatNumber(totalDomains)}</div>
                <div className="text-sm text-muted-foreground">{t('lists.totalDomains')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{lists.length}</div>
                <div className="text-sm text-muted-foreground">{t('lists.title')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">{t('lists.title')}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGravityUpdate} 
              disabled={updating}
            >
              <RefreshCw className={cn('h-4 w-4', updating && 'animate-spin')} />
              <span className="ml-2">
                {updating ? t('lists.gravityRunning') : t('lists.runGravity')}
              </span>
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">{t('lists.addList')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Form */}
          {showAdd && (
            <div className="flex flex-col sm:flex-row gap-2 rounded-xl border bg-muted/50 p-4">
              <Input
                placeholder={t('lists.url')}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addList()}
                className="flex-1"
                autoFocus
              />
              <Select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                options={[
                  { value: 'ads', label: t('lists.ads') },
                  { value: 'tracking', label: t('lists.tracking') },
                  { value: 'malware', label: t('lists.malware') },
                  { value: 'phishing', label: t('lists.phishing') },
                  { value: 'crypto', label: t('lists.crypto') },
                  { value: 'custom', label: t('lists.custom') }
                ]}
                className="w-full sm:w-36"
              />
              <div className="flex gap-2">
                <Button onClick={addList} disabled={isAdding || !newUrl.trim()}>
                  {isAdding ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setShowAdd(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Lists */}
          {apiLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
                  <Skeleton className="h-6 w-11" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-9" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {lists.map((list, i) => {
                const categoryConfig = getCategoryConfig(list.category)
                
                return (
                  <div 
                    key={i} 
                    className={cn(
                      'flex items-center gap-4 rounded-xl border p-4 transition-all',
                      list.enabled ? 'bg-background' : 'bg-muted/30 opacity-60'
                    )}
                  >
                    <Switch 
                      checked={list.enabled} 
                      onChange={() => toggleList(i)} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-sm">{list.url}</span>
                        <a 
                          href={list.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant={list.enabled ? 'success' : 'secondary'}>
                          {list.enabled ? t('lists.enabled') : t('lists.disabled')}
                        </Badge>
                        <Badge variant={categoryConfig.variant}>
                          {categoryConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ~{formatNumber(list.domains)} {t('lists.domains')}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeList(i)}
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
