import { Shield, LayoutDashboard, List, ListChecks, ListX, Settings, Globe, Users, Server, Network, Activity, FileText, Sun, Moon } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import { languageNames } from '../i18n'

export function Sidebar({ currentPage, onNavigate }) {
  const { t, lang, setLang } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const navGroups = [
    {
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') }
      ]
    },
    {
      title: 'DNS',
      items: [
        { id: 'queries', icon: List, label: t('nav.queries') },
        { id: 'lists', icon: ListChecks, label: t('nav.lists') },
        { id: 'whitelist', icon: ListChecks, label: t('nav.whitelist') },
        { id: 'blacklist', icon: ListX, label: t('nav.blacklist') }
      ]
    },
    {
      title: t('network.title'),
      items: [
        { id: 'clients', icon: Users, label: t('nav.clients') },
        { id: 'dns', icon: Server, label: t('nav.dns') },
        { id: 'network', icon: Network, label: t('nav.network') }
      ]
    },
    {
      title: t('nav.system'),
      items: [
        { id: 'system', icon: Activity, label: t('nav.system') },
        { id: 'logs', icon: FileText, label: t('nav.logs') },
        { id: 'settings', icon: Settings, label: t('nav.settings') }
      ]
    }
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card flex flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-lg font-bold">TrBlockerAd</span>
          <p className="text-[10px] text-muted-foreground">{t('status.networkProtection')}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                    currentPage === id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code} className="bg-card">{name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            title={theme === 'dark' ? t('settings.light') : t('settings.dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground text-center">
          TrBlockerAd v1.0.0 • by tronoss99
        </div>
      </div>
    </aside>
  )
}
