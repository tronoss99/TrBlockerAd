import { useState } from 'react'
import { Plus, Trash2, Check, X, Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../context/LanguageContext'
import { useBlacklist } from '../hooks/usePihole'

export function Blacklist() {
  const { t } = useLanguage()
  const { domains, loading, addDomain, removeDomain } = useBlacklist()
  const [showAdd, setShowAdd] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [domainType, setDomainType] = useState('exact')

  const handleAdd = async () => {
    if (newDomain.trim()) {
      await addDomain(newDomain.trim())
      setNewDomain('')
      setShowAdd(false)
    }
  }

  const handleRemove = async (domain) => {
    if (confirm(t('messages.confirmDelete'))) {
      await removeDomain(domain)
    }
  }

  const exportDomains = () => {
    const content = domains.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'blacklist.txt'
    a.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">{t('blacklist.title')}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportDomains}>
            <Download className="mr-2 h-4 w-4" />
            {t('blacklist.export')}
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('blacklist.add')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="flex gap-2 rounded-lg border bg-muted/50 p-4">
            <Input
              placeholder={t('blacklist.placeholder')}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <select
              value={domainType}
              onChange={(e) => setDomainType(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="exact">{t('blacklist.exact')}</option>
              <option value="wildcard">{t('blacklist.wildcard')}</option>
              <option value="regex">{t('blacklist.regex')}</option>
            </select>
            <Button size="icon" onClick={handleAdd}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('status.loading')}
          </div>
        ) : domains.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('blacklist.empty')}
          </div>
        ) : (
          <div className="space-y-2">
            {domains.map((domain, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{typeof domain === 'string' ? domain : domain.domain}</span>
                  <Badge variant="destructive">{t('blacklist.exact')}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(typeof domain === 'string' ? domain : domain.domain)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
