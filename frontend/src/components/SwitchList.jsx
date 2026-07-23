import { useState } from 'react'
import Setup from './Setup'
import SwitchCard from './SwitchCard'

function SwitchList({ userId, setUserId, switches, setSwitches, API_URL }) {
  const [showSetup, setShowSetup] = useState(false)

  function handleNewSwitch(newSwitch) {
    const uid = newSwitch.userId
    localStorage.setItem('afterkey_userId', uid)
    setUserId(uid)
    setSwitches(prev => [newSwitch, ...prev])
    setShowSetup(false)
  }

  function handleDeleteSwitch(switchId) {
    setSwitches(prev => prev.filter(sw => sw.switchId !== switchId))
  }

  function handleUpdateSwitch(updated) {
    setSwitches(prev => prev.map(sw => sw.switchId === updated.switchId ? updated : sw))
  }

  async function handleCheckinAll() {
    const active = switches.filter(sw => sw.status === 'active')
    await Promise.all(active.map(sw =>
      fetch(`${API_URL}/api/checkin/${sw.switchId}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.lastCheckin) {
            handleUpdateSwitch({ ...sw, lastCheckin: data.lastCheckin, deadline: data.deadline })
          }
        })
        .catch(console.error)
    ))
  }

  const activeSwitches = switches.filter(sw => sw.status === 'active')

  return (
    <div className="ak-body">
      <div className="ak-switches-header">
        <div>
          <h2 className="ak-switches-title">My Switches</h2>
          <p className="ak-switches-sub">
            {switches.length === 0
              ? 'No switches yet. Create one to get started.'
              : `${activeSwitches.length} active · ${switches.length} total`}
          </p>
        </div>
        <div className="ak-switches-actions">
          {activeSwitches.length > 1 && (
            <button className="btn-checkin-all" onClick={handleCheckinAll}>
              Check in all ({activeSwitches.length}) →
            </button>
          )}
          <button className="btn-primary ak-new-btn" onClick={() => setShowSetup(!showSetup)}>
            {showSetup ? 'Cancel' : '+ New switch'}
          </button>
        </div>
      </div>

      {showSetup && (
        <div className="ak-setup-wrapper">
          <Setup setSwitchData={handleNewSwitch} API_URL={API_URL} />
        </div>
      )}

      {switches.length === 0 && !showSetup && (
        <div className="ak-empty-state">
          <p>You have no switches yet.</p>
          <button className="btn-primary" onClick={() => setShowSetup(true)}>
            Create your first switch →
          </button>
        </div>
      )}

      <div className="ak-switch-grid">
        {switches.map(sw => (
          <SwitchCard
            key={sw.switchId}
            switchData={sw}
            onUpdate={handleUpdateSwitch}
            onDelete={handleDeleteSwitch}
            API_URL={API_URL}
          />
        ))}
      </div>
    </div>
  )
}

export default SwitchList