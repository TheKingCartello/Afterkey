import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    n: '01',
    title: 'Connect wallet',
    desc: 'MetaMask or any injected provider. No account needed — your address is your identity.'
  },
  {
    n: '02',
    title: 'Set your switch',
    desc: 'Choose a beneficiary address, how often you\'ll check in, and how much ETH to transfer if you go silent.'
  },
  {
    n: '03',
    title: 'Stay active',
    desc: 'Hit "I\'m alive" before your deadline. Miss it and AfterKey executes the transfer onchain via KeeperHub.'
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
      className="ak-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`
      }}
    >
      <div className="ak-step-n">{step.n}</div>
      <div className="ak-step-t">{step.title}</div>
      <div className="ak-step-d">{step.desc}</div>
    </div>
  )
}

function HowItWorks() {
  return (
    <div className="ak-steps">
      {steps.map((step, i) => (
        <Step key={i} step={step} index={i} />
      ))}
    </div>
  )
}

export default HowItWorks