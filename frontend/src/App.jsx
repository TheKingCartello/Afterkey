import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Setup from './components/Setup'
import SwitchList from './components/SwitchList'
import HowItWorks from './components/HowItWorks'

const API_URL = 'https://afterkey-production.up.railway.app'

function Home({ userId, switches }) {
  return (
    <div className="ak-body">
      <div className="ak-eyebrow">Onchain inheritance protocol</div>
      <h1 className="ak-headline">Your assets.<br /><em>Their future.</em></h1>
      <p className="ak-sub">A dead man's switch for self-custodied crypto. Miss a check-in and AfterKey transfers your assets onchain — automatically, with full audit trail.</p>
      <HowItWorks />
      <div className="ak-home-cta">
        {switches.length > 0 ? (
          <Link to="/switches" className="btn-primary ak-cta-btn">
            View my switches ({switches.length}) →
          </Link>
        ) : (
          <Link to="/switches" className="btn-primary ak-cta-btn">
            Get started →
          </Link>
        )}
      </div>
    </div>
  )
}

function AppInner() {
  const [userId, setUserId] = useState(localStorage.getItem('afterkey_userId'))
  const [switches, setSwitches] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (!userId) return
    fetch(`${API_URL}/api/switch/user/${userId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setSwitches(Array.isArray(data) ? data : []))
      .catch(() => setSwitches([]))
  }, [userId])

  return (
    <div>
      <nav className="ak-nav">
        <div className="ak-nav-left">
          <Link to="/" className="ak-logo">After<span>Key</span></Link>
          <div className="ak-net-pill">Sepolia testnet</div>
        </div>
        <div className="ak-nav-right">
          <Link to="/switches" className="ak-nav-link">
            My Switches {switches.length > 0 && <span className="ak-nav-badge">{switches.length}</span>}
          </Link>
          <button className="ak-mode-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀ Light' : '◑ Dark'}
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home userId={userId} switches={switches} />} />
        <Route path="/switches" element={
          <SwitchList
            userId={userId}
            setUserId={setUserId}
            switches={switches}
            setSwitches={setSwitches}
            API_URL={API_URL}
          />
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}

export default App