import { useState, useEffect } from 'react'

function Dashboard({ switchData, setSwitchData, API_URL }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/switch/${switchData.userId}`)
        if (res.ok) setSwitchData(await res.json())
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 30000)
    return () => clearInterval(poll)
  }, [switchData.userId])

  const lastCheckin = new Date(switchData.lastCheckin)
  const deadline = new Date(lastCheckin.getTime() + switchData.intervalDays * 24 * 60 * 60 * 1000)
  const totalMs = switchData.intervalDays * 24 * 60 * 60 * 1000
  const remainingMs = Math.max(deadline - now, 0)
  const elapsed = Math.min((totalMs - remainingMs) / totalMs, 1)

  const hours = Math.floor(remainingMs / (1000 * 60 * 60))
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000)

  const timeDisplay = remainingMs < 1000 * 60 * 60 * 24
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${Math.ceil(remainingMs / (1000 * 60 * 60 * 24))}`

  const timeLabel = remainingMs < 1000 * 60 * 60 * 24 ? 'remaining' : 'days left'

  const circumference = 2 * Math.PI * 76
  const strokeDashoffset = circumference * (1 - elapsed)
  const ringColor = elapsed > 0.8 ? 'var(--red)' : elapsed > 0.5 ? 'var(--amber)' : 'var(--accent)'

  const lastFailedTx = switchData.txHistory?.slice().reverse().find(tx => tx.error)
  const showRetry = switchData.status === 'failed' ||
    (switchData.txHistory?.length > 0 &&
      switchData.txHistory[switchData.txHistory.length - 1].status === 'failed')

  async function handleCheckin() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_URL}/api/checkin/${switchData.userId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSwitchData({ ...switchData, lastCheckin: data.lastCheckin })
      setMessage('Checked in successfully')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRetry() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_URL}/api/switch/retry/${switchData.userId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSwitchData(data.switch)
      setMessage('Retry triggered — check transaction history')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    try {
      await fetch(`${API_URL}/api/switch/${switchData.userId}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete switch:', err)
    }
    localStorage.removeItem('afterkey_userId')
    setSwitchData(null)
  }

  return (
    <div>
      <div className="ak-card">
        <div className="ak-split">
          <div className="ak-left">
            <div className="ring-wrap">
              <svg viewBox="0 0 180 180">
                <circle
                  cx="90" cy="90" r="76"
                  fill="none"
                  stroke="var(--ring-track)"
                  strokeWidth="10"
                />
                <circle
                  cx="90" cy="90" r="76"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="ring-label">
                <span className="ring-time" style={{ fontSize: remainingMs < 1000 * 60 * 60 * 24 ? '1.1rem' : '1.4rem' }}>
                  {timeDisplay}
                </span>
                <span className="ring-sub">{timeLabel}</span>
              </div>
            </div>

            <div className={`ak-status-badge ${switchData.status}`}>
              <div className="ak-status-dot" />
              {switchData.status}
            </div>
          </div>

          <div className="ak-right">
            <div className="ak-field">
              <span className="ak-field-label">Beneficiary</span>
              <span className="ak-field-val mono">{switchData.beneficiary.slice(0, 6)}...{switchData.beneficiary.slice(-4)}</span>
            </div>
            <div className="ak-field">
              <span className="ak-field-label">Transfer amount</span>
              <span className="ak-field-val">{switchData.amount} ETH</span>
            </div>
            <div className="ak-field">
              <span className="ak-field-label">Interval</span>
              <span className="ak-field-val">
                {switchData.intervalDays === 0.01 ? 'Every 15 min (demo)' :
                  switchData.intervalDays === 1 ? 'Every day' :
                    `Every ${switchData.intervalDays} days`}
              </span>
            </div>
            <div className="ak-field">
              <span className="ak-field-label">Last check-in</span>
              <span className="ak-field-val">{lastCheckin.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {message && <p className="ak-message">{message}</p>}

            <button className="btn-alive" onClick={handleCheckin} disabled={loading}>
              {loading ? 'Checking in...' : "I'm alive →"}
            </button>
          </div>
        </div>

        {showRetry && (
          <div className="failure-box">
            <p className="failure-reason">
              ⚠ {lastFailedTx?.error || switchData.lastError || 'Transfer failed'}
            </p>
            <button className="btn-retry" onClick={handleRetry} disabled={loading}>
              {loading ? 'Retrying...' : 'Retry transfer'}
            </button>
          </div>
        )}

        <div className="ak-tx-header">Transaction history</div>

        {switchData.txHistory.length === 0 ? (
          <p className="ak-empty">No transactions yet. Your switch is watching.</p>
        ) : (
          switchData.txHistory.map((tx, i) => (
            <div className="ak-tx-row" key={i}>
              <div className="ak-tx-main">
                <span className="ak-tx-date">
                  {new Date(tx.triggeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' · '}
                  {new Date(tx.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`badge ${tx.status}`}>{tx.status}</span>
                {tx.transactionLink && (
                  <a href={tx.transactionLink} target="_blank" rel="noreferrer" className="ak-view-link">
                    View ↗
                  </a>
                )}
                {tx.attempt && (
                  <span className="ak-tx-meta">Attempt {tx.attempt}/3</span>
                )}
              </div>
              {tx.completedAt && (
                <div className="ak-tx-details">
                  {tx.error && <span>⚠ {tx.error}</span>}
                  {tx.gasUsedWei && !tx.error && <span>{Number(tx.gasUsedWei).toLocaleString()} wei</span>}
                  {tx.gasUsedWei && !tx.error && <span>sponsored</span>}
                  <span>✓ {new Date(tx.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="ak-footer">
        <button className="btn-reset" onClick={handleReset}>Reset switch</button>
        <span className="ak-powered">Executed by <strong>KeeperHub</strong></span>
      </div>
    </div>
  )
}

export default Dashboard