import { useState, useEffect } from 'react'
import Setup from './components/Setup'
import Dashboard from './components/Dashboard'
import HowItWorks from './components/HowItWorks'

const API_URL = 'https://afterkey-production.up.railway.app'

function App() {
  const [switchData, setSwitchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const userId = localStorage.getItem('afterkey_userId')

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetch(`${API_URL}/api/switch/${userId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { setSwitchData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="loading">Loading AfterKey...</div>

  return (
    <div>
      <nav className="ak-nav">
        <div className="ak-nav-left">
          <div className="ak-logo">After<span>Key</span></div>
          <div className="ak-net-pill">Sepolia testnet</div>
        </div>
        <button className="ak-mode-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀ Light' : '◑ Dark'}
        </button>
      </nav>

      <div className="ak-body">
        {!switchData && (
          <>
            <div className="ak-eyebrow">Onchain inheritance protocol</div>
            <h1 className="ak-headline">Your assets.<br /><em>Their future.</em></h1>
            <p className="ak-sub">A dead man's switch for self-custodied crypto. Miss a check-in and AfterKey transfers your assets onchain — automatically, with full audit trail.</p>
            <HowItWorks />
          </>
        )}
        {switchData
          ? <Dashboard switchData={switchData} setSwitchData={setSwitchData} API_URL={API_URL} />
          : <Setup setSwitchData={setSwitchData} API_URL={API_URL} />
        }
      </div>
    </div>
  )
}

export default App