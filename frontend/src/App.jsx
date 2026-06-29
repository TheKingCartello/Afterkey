import { useState, useEffect } from 'react'
import Setup from './components/Setup'
import Dashboard from './components/Dashboard'
import HowItWorks from './components/HowItWorks'

function App() {
  const [switchData, setSwitchData] = useState(null)
  const [loading, setLoading] = useState(true)

  const userId = localStorage.getItem('afterkey_userId')

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    fetch(`http://localhost:3000/api/switch/${userId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setSwitchData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="loading">Loading AfterKey...</div>

  return (
    <div className="app">
      <header>
        <div className="logo">AfterKey</div>
        <p className="tagline">Your onchain dead man's switch</p>
      </header>
      <main>
        {!switchData && <HowItWorks />}
        {switchData
          ? <Dashboard switchData={switchData} setSwitchData={setSwitchData} />
          : <Setup setSwitchData={setSwitchData} />
        }
      </main>
    </div>
  )
}

export default App