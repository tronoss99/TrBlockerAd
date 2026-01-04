import { useState } from 'react'
import { Plus, Trash2, Check, X, Download, Upload, Search, RefreshCw, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'
import { useWhitelist } from '../hooks/usePihole'
import { cn } from '../lib/utils'

export function Whitelist() {
  const { t } = useLanguage()
  const { domains, loading, addDomain, removeDomain, refresh } = useWhitelist()
  const [showAdd, setShowAdd] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [domainType, setDomainType] = useState('exact')
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const typeOptions = [
    { value: 'exact', label: t('whitelist.exact') },
    { value: 'wildcard', label: t('whitelist.wildcard') },
    { value: 'regex', label: t('whitelist.regex') }
  ]

  const handleAdd = async () => {
    if (newDomain.trim()) {
      setIsAdding(true)
      const success = await addDomain(newDomain.trim(), domainType)
      if (success) {
        setNewDomain('')
        setShowAdd(false)
      }
      setIsAdding(false)
    }
  }

  const handleRemove = async (domain) => {
    if (confirm(t('messages.confirmDelete'))) {
      await removeDomain(typeof domain === 'string' ? domain : domain.domain)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setIsRefreshing(false)
  }

  const exportDomains = () => {
    const content = domains.map(d => typeof d === 'string' ? d : d.domain).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whitelist-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredDomains = domains.filter(d => {
    const domain = typeof d === 'string' ? d : d.domain
    return domain.toLowerCase().includes(search.toLowerCase())
  })

  const getTypeVariant = (type) => {
    switch (type) {
      case 'regex': return 'warning'
      case 'wildcard': return 'info'
      default: return 'success'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{domains.length}</div>
                <div className="text-sm text-muted-foreground">{t('whitelist.title')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">{t('whitelist.title')}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('actions.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:w-48"
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportDomains}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t('whitelist.export')}</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t('whitelist.add')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Form */}
          {showAdd && (
            <div className="flex flex-col sm:flex-row gap-2 rounded-xl border bg-muted/50 p-4">
              <Input
                placeholder={t('whitelist.placeholder')}
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1"
                autoFocus
              />
              <Select
                value={domainType}
                onChange={(e) => setDomainType(e.target.value)}
                options={typeOptions}
                className="w-full sm:w-36"
              />
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={isAdding || !newDomain.trim()}>
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

          {/* Domain List */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-9 w-9" />
                </div>
              ))}
            </div>
          ) : filteredDomains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {search ? t('queryLog.noResults') : t('whitelist.empty')}
              </p>
              {!search && (
                <Button variant="outline" className="mt-4" onClick={() => setShowAdd(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('whitelist.add')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDomains.map((domain, i) => {
                const domainStr = typeof domain === 'string' ? domain : domain.domain
                const type = typeof domain === 'object' ? domain.type : 'exact'
                
                return (
                  <div 
                    key={i} 
                    className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-sm truncate">{domainStr}</span>
                      <Badge variant={getTypeVariant(type)}>
                        {t(`whitelist.${type}`) || type}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemove(domain)}
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
