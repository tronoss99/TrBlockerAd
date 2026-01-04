import { useState } from 'react'
import { Plus, Trash2, Check, X, Server } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../context/LanguageContext'

export function DnsRecords() {
  const { t } = useLanguage()
  const [records, setRecords] = useState([
    { domain: 'nas.local', ip: '192.168.1.100', type: 'A' },
    { domain: 'router.local', ip: '192.168.1.1', type: 'A' },
    { domain: 'printer.local', ip: '192.168.1.50', type: 'A' }
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [newIp, setNewIp] = useState('')
  const [newType, setNewType] = useState('A')

  const addRecord = () => {
    if (newDomain.trim() && newIp.trim()) {
      setRecords(prev => [...prev, { domain: newDomain.trim(), ip: newIp.trim(), type: newType }])
      setNewDomain('')
      setNewIp('')
      setShowAdd(false)
    }
  }

  const removeRecord = (index) => {
    if (confirm(t('messages.confirmDelete'))) {
      setRecords(prev => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">{t('dns.title')}</CardTitle>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('dns.addRecord')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="flex gap-2 rounded-lg border bg-muted/50 p-4">
            <Input
              placeholder={t('dns.domain')}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={t('dns.ip')}
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="w-40"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="CNAME">CNAME</option>
            </select>
            <Button size="icon" onClick={addRecord}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {records.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('dns.empty')}
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">{t('dns.domain')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('dns.ip')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('dns.type')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('actions.remove')}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono">{record.domain}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.ip}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{record.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeRecord(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
