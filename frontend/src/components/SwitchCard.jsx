import { useState, useEffect } from 'react'

function SwitchCard({ switchData, onUpdate, onDelete, API_URL }) {
  const [expanded, setExpanded] = useState(false)
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
        const res = await fetch(`${API_URL}/api/switch/${switchData.switchId}`)
        if (res.ok) onUpdate(await res.json())
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 30000)
    return () => clearInterval(poll)
  }, [switchData.switchId])

  const lastCheckin = new Date(switchData.lastCheckin)
  const deadline = switchData.deadline
    ? new Date(switchData.deadline)
    : new Date(lastCheckin.getTime() + switchData.intervalDays * 24 * 60 * 60 * 1000)

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

  const circumference = 2 * Math.PI * 54
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
      const res = await fetch(`${API_URL}/api/checkin/${switchData.switchId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate({ ...switchData, lastCheckin: data.lastCheckin, deadline: data.deadline })
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
      const res = await fetch(`${API_URL}/api/switch/retry/${switchData.switchId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate(data.switch)
      setMessage('Retry triggered — check transaction history')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      await fetch(`${API_URL}/api/switch/${switchData.switchId}`, { method: 'DELETE' })
      onDelete(switchData.switchId)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  return (
    <div className="ak-switch-card">
      <div className="ak-card-top" onClick={() => setExpanded(!expanded)}>
        <div className="ak-card-ring">
          <svg viewBox="0 0 120 120" width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--ring-track)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="ak-card-ring-label">
            <span className="ak-card-time" style={{ fontSize: remainingMs < 1000 * 60 * 60 * 24 ? '0.6rem' : '0.85rem' }}>
              {timeDisplay}
            </span>
            <span className="ak-card-time-sub">{timeLabel}</span>
          </div>
        </div>

        <div className="ak-card-info">
          <div className="ak-card-beneficiary">
            → {switchData.beneficiary.slice(0, 6)}...{switchData.beneficiary.slice(-4)}
          </div>
          <div className="ak-card-amount">{switchData.amount} ETH</div>
          <div className={`ak-status-badge ${switchData.status}`}>
            <div className="ak-status-dot" />
            {switchData.status}
          </div>
        </div>

        <div className="ak-card-chevron">{expanded ? '↑' : '↓'}</div>
      </div>

      {expanded && (
        <div className="ak-card-expanded">
          <div className="ak-card-fields">
            <div className="ak-field">
              <span className="ak-field-label">Interval</span>
              <span className="ak-field-val">
                {switchData.intervalDays === 0.010417 ? 'Every 15 min (demo)' :
                  switchData.intervalDays === 1 ? 'Every day' :
                    `Every ${switchData.intervalDays} days`}
              </span>
            </div>
            <div className="ak-field">
              <span className="ak-field-label">Last check-in</span>
              <span className="ak-field-val">
                {lastCheckin.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="ak-field">
              <span className="ak-field-label">Triggers at</span>
              <span className="ak-field-val">
                {deadline.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {message && <p className="ak-message">{message}</p>}

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

          <button className="btn-alive" onClick={handleCheckin} disabled={loading}>
            {loading ? 'Checking in...' : "I'm alive →"}
          </button>

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
                  {tx.attempt && <span className="ak-tx-meta">Attempt {tx.attempt}/3</span>}
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

          <div className="ak-card-footer">
            <button className="btn-reset" onClick={handleDelete}>Delete switch</button>
            <span className="ak-powered">Executed by <strong>KeeperHub</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwitchCard