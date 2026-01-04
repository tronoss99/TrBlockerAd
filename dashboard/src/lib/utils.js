import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0'
  
  const n = Number(num)
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M'
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K'
  }
  return n.toLocaleString()
}

export function formatPercent(num) {
  if (num === undefined || num === null || isNaN(num)) return '0%'
  return Number(num).toFixed(1) + '%'
}

export function formatBytes(bytes) {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function formatTime(timestamp) {
  if (!timestamp) return '-'
  
  let date
  if (typeof timestamp === 'number') {
    // Unix timestamp (seconds or milliseconds)
    date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else {
    return '-'
  }
  
  if (isNaN(date.getTime())) return '-'
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'now'
  
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'now'
}

export function truncate(str, length = 30) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
