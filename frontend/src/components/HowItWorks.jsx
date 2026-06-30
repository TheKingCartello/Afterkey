import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    icon: '🔗',
    title: 'Connect your wallet',
    description: 'Link your Ethereum wallet. AfterKey uses your address to identify you — no account needed.'
  },
  {
    icon: '⚙️',
    title: 'Set your switch',
    description: 'Choose a beneficiary address, how often you\'ll check in, and how much ETH to transfer if you go silent.'
  },
  {
    icon: '✅',
    title: 'Check in to stay active',
    description: 'Hit "I\'m alive" before your deadline. Miss it, and AfterKey automatically executes the transfer onchain.'
  }
]

function Step({ step, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`
      }}
    >
      <div className="step-icon">{step.icon}</div>
      <div className="step-content">
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>
    </div>
  )
}

function HowItWorks() {
  return (
    <div className="how-it-works">
      <p className="section-label">How it works</p>
      {steps.map((step, i) => (
        <Step key={i} step={step} index={i} />
      ))}
    </div>
  )
}

export default HowItWorks