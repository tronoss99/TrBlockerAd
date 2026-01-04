import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { QueryLog } from './pages/QueryLog'
import { Lists } from './pages/Lists'
import { Whitelist } from './pages/Whitelist'
import { Blacklist } from './pages/Blacklist'
import { Clients } from './pages/Clients'
import { DnsRecords } from './pages/DnsRecords'
import { Network } from './pages/Network'
import { System } from './pages/System'
import { Logs } from './pages/Logs'
import { Settings } from './pages/Settings'
import { usePihole } from './hooks/usePihole'
import { useLanguage } from './context/LanguageContext'

const PAGES = {
  dashboard: Dashboard,
  queries: QueryLog,
  lists: Lists,
  whitelist: Whitelist,
  blacklist: Blacklist,
  clients: Clients,
  dns: DnsRecords,
  network: Network,
  system: System,
  logs: Logs,
  settings: Settings
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const { data, loading, error, refresh, toggleBlocking } = usePihole()
  const { t } = useLanguage()

  const Page = PAGES[currentPage]
  const status = data?.summary?.status || 'enabled'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="pl-64">
        <Header
          status={status}
          onToggle={toggleBlocking}
          onRefresh={refresh}
          lastUpdate={data?.lastUpdate}
          systemHealth="healthy"
        />
        <main className="p-6">
          {error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {t('status.error')}: {error}
            </div>
          ) : (
            <Page data={data} loading={loading} />
          )}
        </main>
      </div>
    </div>
  )
}
