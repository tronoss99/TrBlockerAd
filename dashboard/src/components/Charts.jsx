import { useMemo } from 'react'
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { useLanguage } from '../context/LanguageContext'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function QueriesChart({ data }) {
  const { t } = useLanguage()

  const chartData = useMemo(() => {
    if (!data?.domains_over_time) return []
    const domains = data.domains_over_time
    const ads = data.ads_over_time || {}
    
    return Object.keys(domains).slice(-24).map(time => ({
      time: new Date(parseInt(time) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: domains[time] || 0,
      blocked: ads[time] || 0
    }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{t('charts.queriesOverTime')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            {t('messages.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

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
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="total" name={t('charts.total')} stroke="#3b82f6" fill="url(#totalGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="blocked" name={t('charts.blockedLabel')} stroke="#ef4444" fill="url(#blockedGradient)" strokeWidth={2} />
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
    return Object.entries(data.querytypes)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: typeof value === 'number' ? value : parseFloat(value)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [data])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.queryTypes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {t('messages.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.queryTypes')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie 
              data={chartData} 
              cx="50%" 
              cy="50%" 
              innerRadius={40} 
              outerRadius={70} 
              paddingAngle={2} 
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
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
    return Object.entries(source)
      .slice(0, 8)
      .map(([domain, count]) => ({
        domain: domain.length > 25 ? domain.slice(0, 25) + '...' : domain,
        count: typeof count === 'number' ? count : parseInt(count)
      }))
      .filter(item => item.count > 0)
  }, [data, isBlocked])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isBlocked ? t('charts.topBlocked') : t('charts.topPermitted')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {t('messages.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isBlocked ? t('charts.topBlocked') : t('charts.topPermitted')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#64748b" />
            <YAxis type="category" dataKey="domain" tick={{ fontSize: 9 }} width={120} stroke="#64748b" />
            <Tooltip content={<CustomTooltip />} />
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
    return Object.entries(data.top_sources)
      .slice(0, 6)
      .map(([client, count]) => ({
        client: client.split('|')[0],
        count: typeof count === 'number' ? count : parseInt(count)
      }))
      .filter(item => item.count > 0)
  }, [data])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.topClients')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {t('messages.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

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
            <Tooltip content={<CustomTooltip />} />
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
    return Object.entries(data.forward_destinations)
      .map(([server, percent]) => ({
        name: server.split('|')[0],
        value: typeof percent === 'number' ? percent : parseFloat(percent)
      }))
      .filter(item => item.value > 0)
  }, [data])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.upstreamServers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {t('messages.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.upstreamServers')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie 
              data={chartData} 
              cx="50%" 
              cy="50%" 
              outerRadius={70} 
              dataKey="value" 
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
