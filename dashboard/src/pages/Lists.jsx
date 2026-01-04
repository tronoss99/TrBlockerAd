import { useState } from 'react'
import { Plus, Trash2, RefreshCw, ExternalLink, Check, X, Download, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Switch } from '../components/ui/Switch'
import { useLanguage } from '../context/LanguageContext'
import { runGravityUpdate } from '../hooks/usePihole'

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
  const [lists, setLists] = useState(DEFAULT_LISTS)
  const [showAdd, setShowAdd] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newCategory, setNewCategory] = useState('custom')
  const [updating, setUpdating] = useState(false)

  const toggleList = (index) => {
    setLists(prev => prev.map((list, i) =>
      i === index ? { ...list, enabled: !list.enabled } : list
    ))
  }

  const removeList = (index) => {
    if (confirm(t('lists.confirmRemove'))) {
      setLists(prev => prev.filter((_, i) => i !== index))
    }
  }

  const addList = () => {
    if (newUrl.trim()) {
      setLists(prev => [...prev, { url: newUrl.trim(), enabled: true, domains: 0, category: newCategory }])
      setNewUrl('')
      setNewCategory('custom')
      setShowAdd(false)
    }
  }

  const handleGravityUpdate = async () => {
    setUpdating(true)
    try {
      await runGravityUpdate()
    } finally {
      setUpdating(false)
    }
  }

  const totalDomains = lists.filter(l => l.enabled).reduce((sum, l) => sum + l.domains, 0)
  const activeLists = lists.filter(l => l.enabled).length

  const getCategoryVariant = (cat) => {
    const variants = { ads: 'destructive', tracking: 'warning', malware: 'destructive', phishing: 'destructive', crypto: 'warning', custom: 'secondary' }
    return variants[cat] || 'secondary'
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeLists}</div>
            <div className="text-sm text-muted-foreground">{t('lists.activeLists')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{(totalDomains / 1000).toFixed(0)}K</div>
            <div className="text-sm text-muted-foreground">{t('lists.totalDomains')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{lists.length}</div>
            <div className="text-sm text-muted-foreground">{t('lists.title')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">{t('lists.title')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleGravityUpdate} disabled={updating}>
              <RefreshCw className={`mr-2 h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
              {updating ? t('lists.gravityRunning') : t('lists.runGravity')}
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('lists.addList')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAdd && (
            <div className="flex gap-2 rounded-lg border bg-muted/50 p-4">
              <Input
                placeholder={t('lists.url')}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ads">{t('lists.ads')}</option>
                <option value="tracking">{t('lists.tracking')}</option>
                <option value="malware">{t('lists.malware')}</option>
                <option value="phishing">{t('lists.phishing')}</option>
                <option value="crypto">{t('lists.crypto')}</option>
                <option value="custom">{t('lists.custom')}</option>
              </select>
              <Button size="icon" onClick={addList}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {lists.map((list, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <Switch checked={list.enabled} onChange={() => toggleList(i)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm">{list.url}</span>
                    <a href={list.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={list.enabled ? 'success' : 'secondary'}>
                      {list.enabled ? t('lists.enabled') : t('lists.disabled')}
                    </Badge>
                    <Badge variant={getCategoryVariant(list.category)}>
                      {t(`lists.${list.category}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ~{(list.domains / 1000).toFixed(0)}K {t('lists.domains')}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeList(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
