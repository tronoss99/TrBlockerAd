import { useState, useEffect, useCallback } from 'react'

// Pi-hole v6 API
const API_BASE = '/api'

// Session ID for authentication
let sessionId = null

async function apiCall(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (sessionId) {
    headers['X-FTL-SID'] = sessionId
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  const data = await res.json()
  
  if (data.session) {
    sessionId = data.session.sid
  }
  
  return data
}

export async function login(password) {
  try {
    const res = await apiCall('/auth', {
      method: 'POST',
      body: JSON.stringify({ password })
    })
    if (res.session) {
      sessionId = res.session.sid
      localStorage.setItem('pihole_sid', sessionId)
      return true
    }
    return false
  } catch {
    return false
  }
}

export function usePihole(refreshInterval = 5000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Try to restore session
  useEffect(() => {
    const savedSid = localStorage.getItem('pihole_sid')
    if (savedSid) sessionId = savedSid
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [stats, blocking] = await Promise.all([
        apiCall('/stats/summary').catch(() => ({})),
        apiCall('/dns/blocking').catch(() => ({ blocking: true }))
      ])
      
      // Map to expected format
      const summary = {
        dns_queries_today: stats.queries?.total || 0,
        ads_blocked_today: stats.queries?.blocked || 0,
        ads_percentage_today: stats.queries?.percent_blocked || 0,
        domains_being_blocked: stats.gravity?.domains_being_blocked || 0,
        status: blocking.blocking ? 'enabled' : 'disabled',
        clients_ever_seen: stats.clients?.total || 0,
        unique_clients: stats.clients?.active || 0
      }
      
      setData({ 
        summary, 
        overTime: stats.queries_over_time || {},
        topItems: { top_queries: {}, top_ads: {} },
        queryTypes: {},
        forwarded: {},
        clients: {},
        lastUpdate: Date.now() 
      })
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  const toggleBlocking = useCallback(async (enable) => {
    try {
      await apiCall('/dns/blocking', {
        method: 'POST',
        body: JSON.stringify({ blocking: enable, timer: null })
      })
      fetchData()
    } catch (err) {
      console.error('Toggle blocking failed:', err)
    }
  }, [fetchData])

  return { data, loading, error, refresh: fetchData, toggleBlocking }
}

export function useQueryLog(limit = 100) {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchQueries = useCallback(async () => {
    try {
      const data = await apiCall(`/queries?length=${limit}`)
      setQueries(data.queries || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchQueries()
  }, [fetchQueries])

  return { queries, loading, refresh: fetchQueries }
}

export function useWhitelist() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDomains = useCallback(async () => {
    try {
      const data = await apiCall('/domains/allow')
      setDomains(data.domains || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addDomain = useCallback(async (domain) => {
    await apiCall('/domains/allow', {
      method: 'POST',
      body: JSON.stringify({ domain })
    })
    fetchDomains()
  }, [fetchDomains])

  const removeDomain = useCallback(async (domain) => {
    await apiCall(`/domains/allow/${encodeURIComponent(domain)}`, {
      method: 'DELETE'
    })
    fetchDomains()
  }, [fetchDomains])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  return { domains, loading, refresh: fetchDomains, addDomain, removeDomain }
}

export function useBlacklist() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDomains = useCallback(async () => {
    try {
      const data = await apiCall('/domains/deny')
      setDomains(data.domains || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addDomain = useCallback(async (domain) => {
    await apiCall('/domains/deny', {
      method: 'POST',
      body: JSON.stringify({ domain })
    })
    fetchDomains()
  }, [fetchDomains])

  const removeDomain = useCallback(async (domain) => {
    await apiCall(`/domains/deny/${encodeURIComponent(domain)}`, {
      method: 'DELETE'
    })
    fetchDomains()
  }, [fetchDomains])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  return { domains, loading, refresh: fetchDomains, addDomain, removeDomain }
}

export function useSystemInfo() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchInfo = useCallback(async () => {
    try {
      const [version, system] = await Promise.all([
        apiCall('/info/version').catch(() => ({})),
        apiCall('/info/system').catch(() => ({}))
      ])
      setInfo({ version, system })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInfo()
  }, [fetchInfo])

  return { info, loading, refresh: fetchInfo }
}

export async function runGravityUpdate() {
  return apiCall('/action/gravity', { method: 'POST' })
}

export async function flushCache() {
  return apiCall('/action/flush/cache', { method: 'POST' })
}

export async function restartDns() {
  return apiCall('/action/restartdns', { method: 'POST' })
}
