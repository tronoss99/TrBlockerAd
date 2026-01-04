import { useState } from 'react'
import { Plus, Trash2, Check, X, Server, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
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
  const [search, setSearch] = useState('')

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

  const filteredRecords = records.filter(r =>
    r.domain.toLowerCase().includes(search.toLowerCase()) ||
    r.ip.toLowerCase().includes(search.toLowerCase())
  )

  const getTypeVariant = (type) => {
    switch (type) {
      case 'A': return 'success'
      case 'AAAA': return 'info'
      case 'CNAME': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{records.length}</div>
                <div className="text-sm text-muted-foreground">{t('dns.title')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <Server className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{records.filter(r => r.type === 'A').length}</div>
                <div className="text-sm text-muted-foreground">{t('dns.aRecords')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                <Server className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{records.filter(r => r.type === 'CNAME').length}</div>
                <div className="text-sm text-muted-foreground">{t('dns.cname')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">{t('dns.title')}</CardTitle>
            <CardDescription>
              Manage local DNS records
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('actions.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-48"
              />
            </div>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">{t('dns.addRecord')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Form */}
          {showAdd && (
            <div className="flex flex-col sm:flex-row gap-2 rounded-xl border bg-muted/50 p-4">
              <Input
                placeholder={t('dns.domain')}
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Input
                placeholder={t('dns.ip')}
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="w-full sm:w-40"
              />
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                options={[
                  { value: 'A', label: 'A' },
                  { value: 'AAAA', label: 'AAAA' },
                  { value: 'CNAME', label: 'CNAME' }
                ]}
                className="w-full sm:w-28"
              />
              <div className="flex gap-2">
                <Button onClick={addRecord} disabled={!newDomain.trim() || !newIp.trim()}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setShowAdd(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Server className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {search ? t('queryLog.noResults') : t('dns.empty')}
              </p>
              {!search && (
                <Button variant="outline" className="mt-4" onClick={() => setShowAdd(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dns.addRecord')}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{t('dns.domain')}</TableHead>
                    <TableHead>{t('dns.ip')}</TableHead>
                    <TableHead>{t('dns.type')}</TableHead>
                    <TableHead className="text-right">{t('actions.remove')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono">{record.domain}</TableCell>
                      <TableCell className="text-muted-foreground">{record.ip}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeVariant(record.type)}>{record.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeRecord(i)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
