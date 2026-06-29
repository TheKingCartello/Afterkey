import { useState } from 'react'
import { BrowserProvider } from 'ethers'

function Setup({ setSwitchData }) {
  const [wallet, setWallet] = useState(null)
  const [form, setForm] = useState({
    beneficiary: '',
    intervalDays: 7,
    amount: '0.01'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function connectWallet() {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install it.')
      return
    }
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setWallet(address)
    } catch (err) {
      setError('Wallet connection cancelled.')
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!wallet) {
      setError('Please connect your wallet first.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:3000/api/switch/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: wallet, ...form })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      localStorage.setItem('afterkey_userId', wallet)
      setSwitchData(data.switch)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup">
      <div className="setup-header">
        <h1>Set up your switch</h1>
        <p>If you stop checking in, AfterKey will automatically transfer your assets to your chosen address.</p>
      </div>

      <form className="setup-form" onSubmit={handleSubmit}>

        {!wallet ? (
          <button type="button" className="btn-connect" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-connected">
            <span className="dot" />
            <span className="wallet-address">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
            <span className="connected-label">Connected</span>
          </div>
        )}

        <div className="field">
          <label>Beneficiary address</label>
          <input
            name="beneficiary"
            placeholder="0x..."
            value={form.beneficiary}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Check-in interval</label>
            <select name="intervalDays" value={form.intervalDays} onChange={handleChange}>
              <option value={0.01}>Every 15 minutes (demo)</option>
              <option value={1}>Every day</option>
              <option value={7}>Every 7 days</option>
              <option value={14}>Every 14 days</option>
              <option value={30}>Every 30 days</option>
            </select>
          </div>

          <div className="field">
            <label>Amount (ETH)</label>
            <input
              name="amount"
              type="number"
              step="0.001"
              min="0.001"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading || !wallet}>
          {loading ? 'Activating...' : 'Activate AfterKey'}
        </button>

      </form>
    </div>
  )
}

export default Setup