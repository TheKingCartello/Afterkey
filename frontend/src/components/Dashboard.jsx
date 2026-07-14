import { useState, useEffect } from 'react'

function Dashboard({ switchData, setSwitchData }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const lastCheckin = new Date(switchData.lastCheckin)
  const deadline = new Date(lastCheckin.getTime() + switchData.intervalDays * 24 * 60 * 60 * 1000)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const totalMs = switchData.intervalDays * 24 * 60 * 60 * 1000
  const remainingMs = Math.max(deadline - now, 0)
  const elapsed = Math.min((totalMs - remainingMs) / totalMs, 1)

  const hours = Math.floor(remainingMs / (1000 * 60 * 60))
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000)

  const timeDisplay = remainingMs < 1000 * 60 * 60 * 24
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${Math.ceil(remainingMs / (1000 * 60 * 60 * 24))}`

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference * (1 - elapsed)
  const ringColor = elapsed > 0.8 ? '#EF4444' : elapsed > 0.5 ? '#F59E0B' : '#3B82F6'

  async function handleCheckin() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`https://afterkey-production.up.railway.app/api/checkin/${switchData.userId}`, {
        method: 'POST'
      })
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

  function handleReset() {
    localStorage.removeItem('afterkey_userId')
    setSwitchData(null)
  }

  return (
    <div className="dashboard">
      <div className="status-card">
        <div className="ring-wrapper">
          <svg viewBox="0 0 120 120" className="ring">
            <circle cx="60" cy="60" r="54" className="ring-bg" />
            <circle
              cx="60" cy="60" r="54"
              className="ring-fill"
              stroke={ringColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="ring-label">
            <span className="days-left" style={{ fontSize: remainingMs < 1000 * 60 * 60 * 24 ? '1rem' : '1.8rem' }}>{timeDisplay}</span>
            <span className="days-text">{remainingMs < 1000 * 60 * 60 * 24 ? 'remaining' : 'days left'}</span>
          </div>
        </div>

        <div className="switch-info">
          <p className="info-row">
            <span>Status</span>
            <span className={`badge ${switchData.status}`}>{switchData.status}</span>
          </p>
          <p className="info-row">
            <span>Beneficiary</span>
            <span className="address">{switchData.beneficiary.slice(0, 6)}...{switchData.beneficiary.slice(-4)}</span>
          </p>
          <p className="info-row">
            <span>Amount</span>
            <span>{switchData.amount} ETH</span>
          </p>
          <p className="info-row">
            <span>Last check-in</span>
            <span>{lastCheckin.toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <button className="btn-checkin" onClick={handleCheckin} disabled={loading}>
        {loading ? 'Checking in...' : "I'm alive"}
      </button>

      <div className="tx-history">
        <h3>Transaction history</h3>
        {switchData.txHistory.length === 0
          ? <p className="empty">No transactions yet. Your switch is watching.</p>
          : switchData.txHistory.map((tx, i) => (
            <div className="tx-row" key={i}>
              <div className="tx-main">
                <span>{new Date(tx.triggeredAt).toLocaleDateString()}</span>
                <span className={`badge ${tx.status}`}>{tx.status}</span>
                {tx.transactionLink && (
                  <a href={tx.transactionLink} target="_blank" rel="noreferrer">View</a>
                )}
              </div>
              {tx.completedAt && (
                <div className="tx-details">
                  {tx.retryCount > 0 && <span>🔄 {tx.retryCount} retr{tx.retryCount === 1 ? 'y' : 'ies'}</span>}
                  {tx.gasUsedWei && <span>⛽ {Number(tx.gasUsedWei).toLocaleString()} wei</span>}
                  {tx.completedAt && <span>✅ {new Date(tx.completedAt).toLocaleTimeString()}</span>}
                </div>
              )}
            </div>
          ))
        }
      </div>

      <button className="btn-reset" onClick={handleReset}>Reset switch</button>
    </div>
  )
}

export default Dashboard