import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, ExternalLink, Check, X, ListChecks, Database, Shield, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Switch } from '../components/ui/Switch'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'
import { useLists, runGravityUpdate } from '../hooks/usePihole'
import { cn, formatNumber } from '../lib/utils'

// Recommended blocklists
const RECOMMENDED_LISTS = [
  { url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts', category: 'ads', domains: 180000 },
  { url: 'https://raw.githubusercontent.com/oisd-blocklist/oisd/master/domains', category: 'ads', domains: 100000 },
  { url: 'https://v.firebog.net/hosts/Easyprivacy.txt', category: 'tracking', domains: 15000 },
  { url: 'https://v.firebog.net/hosts/Prigent-Ads.txt', category: 'ads', domains: 50000 },
  { url: 'https://v.firebog.net/hosts/Prigent-Tracking.txt', category: 'tracking', domains: 30000 },
  { url: 'https://raw.githubusercontent.com/Perflyst/PiHoleBlocklist/master/SmartTV.txt', category: 'tracking', domains: 5000 },
  { url: 'https://raw.githubusercontent.com/Perflyst/PiHoleBlocklist/master/AmazonFireTV.txt', category: 'tracking', domains: 3000 },
  { url: 'https://v.firebog.net/hosts/AdguardDNS.txt', category: 'ads', domains: 45000 },
  { url: 'https://v.firebog.net/hosts/Easylist.txt', category: 'ads', domains: 32000 },
  { url: 'https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt', category: 'ads', domains: 48000 },
  { url: 'https://phishing.army/download/phishing_army_blocklist_extended.txt', category: 'phishing', domains: 12000 },
  { url: 'https://v.firebog.net/hosts/Prigent-Crypto.txt', category: 'crypto', domains: 8000 },
  { url: 'https://v.firebog.net/hosts/Prigent-Malware.txt', category: 'malware', domains: 25000 }
]

export function Lists() {
  const { t } = useLanguage()
  const { lists: apiLists, loading: apiLoading, addList: apiAddList, removeList: apiRemoveList, toggleList: apiToggleList, refresh } = useLists()
  const [lists, setLists] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newCategory, setNewCategory] = useState('custom')
  const [bulkUrls, setBulkUrls] = useState('')
  const [updating, setUpdating] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [notification, setNotification] = useState(null) // { type: 'success' | 'error', message: string }
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 })

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Use API lists if available
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
        setNotification({ type: 'success', message: t('messages.added') })
        setNewUrl('')
        setNewCategory('custom')
        setShowAdd(false)
      } else {
        setNotification({ type: 'error', message: t('messages.failed') + ' - API error' })
        // Still add to local state for display
        setLists(prev => [...prev, { url: newUrl.trim(), enabled: true, domains: 0, category: newCategory }])
        setNewUrl('')
        setNewCategory('custom')
        setShowAdd(false)
      }
      setIsAdding(false)
    }
  }

  // Bulk import - one URL per line
  const handleBulkImport = async () => {
    const urls = bulkUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'))
    
    if (urls.length === 0) return

    setIsAdding(true)
    setImportProgress({ current: 0, total: urls.length })
    setImportResults({ success: 0, failed: 0 })

    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < urls.length; i++) {
      setImportProgress({ current: i + 1, total: urls.length })
      const success = await apiAddList(urls[i], 'custom')
      if (success) {
        successCount++
      } else {
        failedCount++
      }
      setImportResults({ success: successCount, failed: failedCount })
      await new Promise(r => setTimeout(r, 300))
    }

    setBulkUrls('')
    setShowBulkImport(false)
    setIsAdding(false)
    setImportProgress({ current: 0, total: 0 })
    
    if (successCount > 0) {
      setNotification({ 
        type: failedCount > 0 ? 'warning' : 'success', 
        message: `${successCount} ${t('messages.added')}${failedCount > 0 ? `, ${failedCount} ${t('messages.failed')}` : ''}`
      })
    } else {
      setNotification({ type: 'error', message: t('messages.failed') })
    }
    
    await refresh()
  }

  // Load all recommended lists
  const loadRecommendedLists = async () => {
    if (!confirm(t('lists.confirmLoadRecommended'))) return

    setIsAdding(true)
    setImportProgress({ current: 0, total: RECOMMENDED_LISTS.length })
    setImportResults({ success: 0, failed: 0 })

    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < RECOMMENDED_LISTS.length; i++) {
      const list = RECOMMENDED_LISTS[i]
      setImportProgress({ current: i + 1, total: RECOMMENDED_LISTS.length })
      const success = await apiAddList(list.url, list.category)
      if (success) {
        successCount++
      } else {
        failedCount++
      }
      setImportResults({ success: successCount, failed: failedCount })
      await new Promise(r => setTimeout(r, 300))
    }

    setIsAdding(false)
    setImportProgress({ current: 0, total: 0 })
    
    if (successCount > 0) {
      setNotification({ 
        type: failedCount > 0 ? 'warning' : 'success', 
        message: `${successCount} ${t('lists.title')} ${t('messages.added')}${failedCount > 0 ? `, ${failedCount} ${t('messages.failed')}` : ''}`
      })
    } else {
      setNotification({ type: 'error', message: t('messages.failed') })
    }
    
    await refresh()
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
      {/* Notification Toast */}
      {notification && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-top-2',
          notification.type === 'success' && 'bg-green-500/10 border-green-500/30 text-green-500',
          notification.type === 'error' && 'bg-red-500/10 border-red-500/30 text-red-500',
          notification.type === 'warning' && 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
        )}>
          {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
          {notification.type === 'warning' && <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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

      {/* Quick Actions */}
      {lists.length === 0 && !apiLoading && (
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Shield className="h-12 w-12 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{t('lists.getStarted')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('lists.getStartedDesc')}</p>
              </div>
              <Button onClick={loadRecommendedLists} disabled={isAdding}>
                {isAdding ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    {importProgress.current}/{importProgress.total}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {t('lists.loadRecommended')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">{t('lists.title')}</CardTitle>
            <CardDescription>{t('lists.description')}</CardDescription>
          </div>
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
            <Button variant="outline" size="sm" onClick={() => setShowBulkImport(true)}>
              <Upload className="h-4 w-4" />
              <span className="ml-2">{t('lists.bulkImport')}</span>
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">{t('lists.addList')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bulk Import Form */}
          {showBulkImport && (
            <div className="rounded-xl border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                {t('lists.bulkImportTitle')}
              </div>
              <textarea
                placeholder={t('lists.bulkImportPlaceholder')}
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                className="w-full h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {bulkUrls.split('\n').filter(u => u.trim().startsWith('http')).length} URLs
                </span>
                <div className="flex gap-2">
                  <Button onClick={handleBulkImport} disabled={isAdding || !bulkUrls.trim()}>
                    {isAdding ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        {importProgress.current}/{importProgress.total}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t('lists.import')}
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowBulkImport(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Single Form */}
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
          ) : lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListChecks className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t('lists.empty')}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAdd(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('lists.addList')}
                </Button>
                <Button onClick={loadRecommendedLists}>
                  <Shield className="h-4 w-4 mr-2" />
                  {t('lists.loadRecommended')}
                </Button>
              </div>
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
