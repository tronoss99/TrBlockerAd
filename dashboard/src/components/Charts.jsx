import { useMemo } from 'react'
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { useLanguage } from '../context/LanguageContext'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function QueriesChart({ data }) {
  const { t } = useLanguage()

  const chartData = useMemo(() => {
    if (!data?.domains_over_time || !data?.ads_over_time) return []
    const domains = data.domains_over_time
    const ads = data.ads_over_time
    return Object.keys(domains).map(time => ({
      time: new Date(parseInt(time) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: domains[time],
      blocked: ads[time] || 0
    }))
  }, [data])

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('charts.queriesOverTime')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="total" name={t('charts.total')} stroke="#3b82f6" fill="url(#totalGradient)" />
            <Area type="monotone" dataKey="blocked" name={t('charts.blockedLabel')} stroke="#22c55e" fill="url(#blockedGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function QueryTypesChart({ data }) {
  const { t } = useLanguage()

  const chartData = useMemo(() => {
    if (!data?.querytypes) return []
    return Object.entries(data.querytypes).map(([name, value]) => ({
      name,
      value: parseFloat(value)
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.queryTypes')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {chartData.slice(0, 4).map((item, i) => (
            <div key={item.name} className="flex items-center gap-1 text-xs">
              <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TopDomainsChart({ data, type = 'blocked' }) {
  const { t } = useLanguage()
  const isBlocked = type === 'blocked'

  const chartData = useMemo(() => {
    const source = isBlocked ? data?.top_ads : data?.top_queries
    if (!source) return []
    return Object.entries(source).slice(0, 8).map(([domain, count]) => ({
      domain: domain.length > 20 ? domain.slice(0, 20) + '...' : domain,
      count
    }))
  }, [data, isBlocked])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isBlocked ? t('charts.topBlocked') : t('charts.topPermitted')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#64748b" />
            <YAxis type="category" dataKey="domain" tick={{ fontSize: 9 }} width={100} stroke="#64748b" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Bar dataKey="count" fill={isBlocked ? '#ef4444' : '#22c55e'} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ClientsChart({ data }) {
  const { t } = useLanguage()

  const chartData = useMemo(() => {
    if (!data?.top_sources) return []
    return Object.entries(data.top_sources).slice(0, 6).map(([client, count]) => ({
      client: client.split('|')[0],
      count
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.topClients')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="client" tick={{ fontSize: 9 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function UpstreamChart({ data }) {
  const { t } = useLanguage()

  const chartData = useMemo(() => {
    if (!data?.forward_destinations) return []
    return Object.entries(data.forward_destinations).map(([server, percent]) => ({
      name: server.split('|')[0],
      value: parseFloat(percent)
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.upstreamServers')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
