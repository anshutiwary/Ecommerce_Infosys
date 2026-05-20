import { useEffect, useState } from 'react'

const formatTime = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(value)

function LiveStatusBar({ itemCount = 0, lastUpdated, label = 'Live catalog' }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="live-status-bar">
      <span className="live-pulse" aria-hidden="true" />
      <strong>{label}</strong>
      <span>{itemCount} records</span>
      <span>Now {formatTime(now)}</span>
      <span>
        Synced {lastUpdated ? formatTime(lastUpdated) : 'pending'}
      </span>
    </div>
  )
}

export default LiveStatusBar
