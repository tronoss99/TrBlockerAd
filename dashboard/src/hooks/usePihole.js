import { useState, useEffect, useCallback } from 'react'

// Pi-hole v6 API
const API_BASE = '/admin/api.php'

export function usePihole(refreshInterval = 5000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [summary, overTime, topItems, queryTypes, forwarded, clients] = await Promise.all([
        fetch(`${API_BASE}?summaryRaw`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}?overTimeData10mins`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}?topItems=10`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}?getQueryTypes`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}?getForwardDestinations`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}?getQuerySources&topClientsBlocked`).then(r => r.json()).catch(() => ({}))
      ])
      setData({ summary, overTime, topItems, queryTypes, forwarded, clients, lastUpdate: Date.now() })
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
    const action = enable ? 'enable' : 'disable'
    await fetch(`${API_BASE}?${action}`)
    fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData, toggleBlocking }
}

export function useQueryLog(limit = 100) {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchQueries = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}?getAllQueries=${limit}`)
      const data = await res.json()
      setQueries(data.data || [])
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
      const res = await fetch(`${API_BASE}?list=white`)
      const data = await res.json()
      setDomains(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addDomain = useCallback(async (domain) => {
    await fetch(`${API_BASE}?list=white&add=${encodeURIComponent(domain)}`)
    fetchDomains()
  }, [fetchDomains])

  const removeDomain = useCallback(async (domain) => {
    await fetch(`${API_BASE}?list=white&sub=${encodeURIComponent(domain)}`)
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
      const res = await fetch(`${API_BASE}?list=black`)
      const data = await res.json()
      setDomains(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addDomain = useCallback(async (domain) => {
    await fetch(`${API_BASE}?list=black&add=${encodeURIComponent(domain)}`)
    fetchDomains()
  }, [fetchDomains])

  const removeDomain = useCallback(async (domain) => {
    await fetch(`${API_BASE}?list=black&sub=${encodeURIComponent(domain)}`)
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
      const [version, cacheInfo] = await Promise.all([
        fetch(`${API_BASE}?version`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}?getCacheInfo`).then(r => r.json()).catch(() => ({}))
      ])
      setInfo({ version, cacheInfo })
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
  return fetch(`${API_BASE}?updateGravity`)
}

export async function flushCache() {
  return fetch(`${API_BASE}?flushCache`)
}

export async function restartDns() {
  return fetch(`${API_BASE}?restartdns`)
}
