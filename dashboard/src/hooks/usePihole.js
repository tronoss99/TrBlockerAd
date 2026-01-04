import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = '/api'

// Helper for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    })
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    console.error(`API call failed: ${endpoint}`, err)
    throw err
  }
}

export function usePihole(refreshInterval = 5000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      // Pi-hole v6 API endpoints
      const [stats, blocking, history, topDomains, topClients, queryTypes, upstreams] = await Promise.all([
        apiCall('/stats/summary').catch(() => ({})),
        apiCall('/dns/blocking').catch(() => ({ blocking: true })),
        apiCall('/history').catch(() => null),
        apiCall('/stats/top_domains?blocked=true&count=10').catch(() => null),
        apiCall('/stats/top_clients?count=10').catch(() => null),
        apiCall('/stats/query_types').catch(() => null),
        apiCall('/stats/upstreams').catch(() => null)
      ])

      // Map Pi-hole v6 response to our format
      const summary = {
        dns_queries_today: stats.queries?.total || 0,
        ads_blocked_today: stats.queries?.blocked || 0,
        ads_percentage_today: stats.queries?.percent_blocked || 0,
        domains_being_blocked: stats.gravity?.domains_being_blocked || 0,
        status: blocking.blocking !== false ? 'enabled' : 'disabled',
        clients_ever_seen: stats.clients?.total || 0,
        unique_clients: stats.clients?.active || 0,
        queries_forwarded: stats.queries?.forwarded || 0,
        queries_cached: stats.queries?.cached || 0,
        cache_inserted: stats.cache?.inserted || 0,
        cache_evicted: stats.cache?.evicted || 0,
        memory: stats.system?.memory?.ram?.used || 0,
        load: stats.system?.cpu?.load || [0, 0, 0],
        reply_time: stats.queries?.reply_time || 0,
        database_size: stats.database?.size || 0,
        gravity_last_updated: stats.gravity?.last_update || null
      }

      // Process history data for charts
      let overTime = { domains_over_time: {}, ads_over_time: {} }
      if (history?.history) {
        history.history.forEach(item => {
          const timestamp = item.timestamp
          overTime.domains_over_time[timestamp] = item.total
          overTime.ads_over_time[timestamp] = item.blocked
        })
      }

      // Process top domains
      const topItems = {
        top_queries: {},
        top_ads: {}
      }
      if (topDomains?.top_domains) {
        topDomains.top_domains.forEach(item => {
          topItems.top_ads[item.domain] = item.count
        })
      }

      // Process top clients
      const clients = { top_sources: {} }
      if (topClients?.top_clients) {
        topClients.top_clients.forEach(item => {
          const key = item.name ? `${item.ip}|${item.name}` : item.ip
          clients.top_sources[key] = item.count
        })
      }

      // Process query types
      const queryTypesData = { querytypes: {} }
      if (queryTypes?.types) {
        if (Array.isArray(queryTypes.types)) {
          queryTypes.types.forEach(item => {
            queryTypesData.querytypes[item.type] = item.count
          })
        } else if (typeof queryTypes.types === 'object') {
          Object.entries(queryTypes.types).forEach(([type, count]) => {
            queryTypesData.querytypes[type] = count
          })
        }
      }

      // Process upstreams
      const forwarded = { forward_destinations: {} }
      if (upstreams?.upstreams) {
        if (Array.isArray(upstreams.upstreams)) {
          upstreams.upstreams.forEach(item => {
            forwarded.forward_destinations[item.ip] = item.percentage
          })
        } else if (typeof upstreams.upstreams === 'object') {
          Object.entries(upstreams.upstreams).forEach(([ip, percentage]) => {
            forwarded.forward_destinations[ip] = percentage
          })
        }
      }

      setData({
        summary,
        overTime,
        topItems,
        queryTypes: queryTypesData,
        forwarded,
        clients,
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
    intervalRef.current = setInterval(fetchData, refreshInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData, refreshInterval])

  const toggleBlocking = useCallback(async (enable) => {
    try {
      await apiCall('/dns/blocking', {
        method: 'POST',
        body: JSON.stringify({ blocking: enable, timer: null })
      })
      await fetchData()
    } catch (err) {
      console.error('Toggle blocking failed:', err)
    }
  }, [fetchData])

  return { data, loading, error, refresh: fetchData, toggleBlocking }
}

export function useQueryLog(limit = 100) {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiCall(`/queries?length=${limit}`)
      
      // Pi-hole v6 returns queries in a different format
      const formattedQueries = (data.queries || []).map(q => ({
        timestamp: q.time || q.timestamp,
        type: q.type || 'A',
        domain: q.domain || '',
        client: q.client?.name || q.client?.ip || q.client || '',
        status: q.status || 'allowed',
        reply: q.reply?.type || '',
        responseTime: q.reply?.time || 0,
        upstream: q.upstream || '',
        dnssec: q.dnssec || false
      }))
      
      setQueries(formattedQueries)
      setError(null)
    } catch (err) {
      setError(err.message)
      setQueries([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchQueries()
  }, [fetchQueries])

  return { queries, loading, error, refresh: fetchQueries }
}

export function useWhitelist() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDomains = useCallback(async () => {
    try {
      const data = await apiCall('/domains/allow')
      setDomains(data.domains || [])
    } catch (err) {
      console.error('Failed to fetch whitelist:', err)
      setDomains([])
    } finally {
      setLoading(false)
    }
  }, [])

  const addDomain = useCallback(async (domain, type = 'exact') => {
    try {
      await apiCall('/domains/allow', {
        method: 'POST',
        body: JSON.stringify({ domain, type })
      })
      await fetchDomains()
      return true
    } catch (err) {
      console.error('Failed to add domain:', err)
      return false
    }
  }, [fetchDomains])

  const removeDomain = useCallback(async (domain) => {
    try {
      await apiCall(`/domains/allow/${encodeURIComponent(domain)}`, {
        method: 'DELETE'
      })
      await fetchDomains()
      return true
    } catch (err) {
      console.error('Failed to remove domain:', err)
      return false
    }
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
      console.error('Failed to fetch blacklist:', err)
      setDomains([])
    } finally {
      setLoading(false)
    }
  }, [])

  const addDomain = useCallback(async (domain, type = 'exact') => {
    try {
      await apiCall('/domains/deny', {
        method: 'POST',
        body: JSON.stringify({ domain, type })
      })
      await fetchDomains()
      return true
    } catch (err) {
      console.error('Failed to add domain:', err)
      return false
    }
  }, [fetchDomains])

  const removeDomain = useCallback(async (domain) => {
    try {
      await apiCall(`/domains/deny/${encodeURIComponent(domain)}`, {
        method: 'DELETE'
      })
      await fetchDomains()
      return true
    } catch (err) {
      console.error('Failed to remove domain:', err)
      return false
    }
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
      const data = await apiCall('/info/version')
      
      // Pi-hole v6 returns version as object with core, web, ftl, docker keys
      // Each can be a string or an object with version property
      const getVersion = (v) => {
        if (!v) return 'v6.x'
        if (typeof v === 'string') return v
        if (typeof v === 'object' && v.version) return v.version
        return 'v6.x'
      }

      setInfo({
        version: {
          core: getVersion(data.core || data.version),
          ftl: getVersion(data.ftl),
          web: getVersion(data.web)
        },
        branch: data.branch || 'main'
      })
    } catch (err) {
      console.error('Failed to fetch system info:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInfo()
  }, [fetchInfo])

  return { info, loading, refresh: fetchInfo }
}

export function useLists() {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLists = useCallback(async () => {
    try {
      // Try Pi-hole v6 API endpoint
      const res = await fetch(`${API_BASE}/lists`)
      if (res.ok) {
        const data = await res.json()
        // Handle different response formats
        let listsArray = []
        if (data.lists) {
          listsArray = Array.isArray(data.lists) ? data.lists : Object.values(data.lists)
        } else if (data.adlists) {
          listsArray = Array.isArray(data.adlists) ? data.adlists : Object.values(data.adlists)
        } else if (Array.isArray(data)) {
          listsArray = data
        }
        setLists(listsArray)
      } else {
        // Try alternative endpoint
        const res2 = await fetch(`${API_BASE}/adlists`)
        if (res2.ok) {
          const data2 = await res2.json()
          setLists(data2.adlists || data2.lists || [])
        } else {
          setLists([])
        }
      }
    } catch (err) {
      console.error('Failed to fetch lists:', err)
      setLists([])
    } finally {
      setLoading(false)
    }
  }, [])

  const addList = useCallback(async (url, comment = '') => {
    // Pi-hole v6 API - try multiple endpoint/format combinations
    const endpoints = [
      // Try /lists with type in body
      { 
        url: `${API_BASE}/lists`,
        body: { address: url, enabled: true, type: 'block', comment: comment || '' }
      },
      // Try /lists/block endpoint
      {
        url: `${API_BASE}/lists/block`,
        body: { address: url, enabled: true, comment: comment || '' }
      },
      // Try with item wrapper
      {
        url: `${API_BASE}/lists`,
        body: { item: url, type: 'block', enabled: true, comment: comment || '' }
      }
    ]

    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint.url, 'with body:', endpoint.body)
        const res = await fetch(endpoint.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(endpoint.body)
        })
        
        if (res.ok || res.status === 201) {
          console.log('List added successfully:', url)
          await fetchLists()
          return true
        }
        
        const errorText = await res.text().catch(() => '')
        console.log(`Endpoint ${endpoint.url} failed (${res.status}):`, errorText)
      } catch (err) {
        console.log(`Endpoint ${endpoint.url} error:`, err.message)
      }
    }

    console.error('All endpoints failed for adding list')
    return false
  }, [fetchLists])

  const removeList = useCallback(async (id) => {
    try {
      // Try different endpoints
      let res = await fetch(`${API_BASE}/lists/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        res = await fetch(`${API_BASE}/adlists/${id}`, { method: 'DELETE' })
      }
      if (res.ok) {
        await fetchLists()
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to remove list:', err)
      return false
    }
  }, [fetchLists])

  const toggleList = useCallback(async (id, enabled) => {
    try {
      let res = await fetch(`${API_BASE}/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      if (!res.ok) {
        res = await fetch(`${API_BASE}/lists/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled })
        })
      }
      if (res.ok) {
        await fetchLists()
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to toggle list:', err)
      return false
    }
  }, [fetchLists])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  return { lists, loading, refresh: fetchLists, addList, removeList, toggleList }
}

export async function runGravityUpdate() {
  try {
    const res = await fetch(`${API_BASE}/action/gravity`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    // Gravity returns text output, not JSON
    if (!res.ok) {
      throw new Error(`Gravity update failed: ${res.status}`)
    }
    return { success: true }
  } catch (err) {
    console.error('Gravity update error:', err)
    throw err
  }
}

export async function flushCache() {
  return apiCall('/cache/flush', { method: 'DELETE' })
}

export async function restartDns() {
  return apiCall('/dns/restart', { method: 'POST' })
}

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    try {
      // Try multiple endpoints for Pi-hole v6
      const [topClients, clientsData] = await Promise.all([
        apiCall('/stats/top_clients?count=50').catch(() => null),
        apiCall('/clients').catch(() => null)
      ])

      let clientList = []

      // Process top_clients endpoint
      if (topClients?.top_clients && Array.isArray(topClients.top_clients)) {
        clientList = topClients.top_clients.map(c => ({
          ip: c.ip || '',
          name: c.name || c.ip || '',
          queries: c.count || 0,
          blocked: c.blocked || 0
        }))
      } else if (topClients?.clients && Array.isArray(topClients.clients)) {
        clientList = topClients.clients.map(c => ({
          ip: c.ip || '',
          name: c.name || c.ip || '',
          queries: c.count || c.queries || 0,
          blocked: c.blocked || 0
        }))
      }

      // If no data from top_clients, try /clients endpoint
      if (clientList.length === 0 && clientsData?.clients) {
        const clientsArray = Array.isArray(clientsData.clients) 
          ? clientsData.clients 
          : Object.values(clientsData.clients)
        
        clientList = clientsArray.map(c => ({
          ip: c.ip || c.address || '',
          name: c.name || c.hostname || c.ip || '',
          queries: c.count || c.queries || 0,
          blocked: c.blocked || 0
        }))
      }

      setClients(clientList)
    } catch (err) {
      console.error('Failed to fetch clients:', err)
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
    const interval = setInterval(fetchClients, 10000)
    return () => clearInterval(interval)
  }, [fetchClients])

  return { clients, loading, refresh: fetchClients }
}
