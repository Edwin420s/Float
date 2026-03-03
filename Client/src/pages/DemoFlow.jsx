import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import Sidebar from '../components/Sidebar'
import DemoStep from '../components/DemoStep'
import DemoProgressBar from '../components/DemoProgressBar'
import CTAButton from '../components/CTAButton'
import { toast } from 'react-toastify'

export default function DemoFlow() {
  const navigate = useNavigate()
  const { connected, connect, balance } = useWallet()
  const [step, setStep] = useState(1)

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleConnect = async () => {
    await connect()
    setStep(2)
  }

  const handleViewRecommendation = () => {
    setStep(3)
  }

  const handleExecutePayment = () => {
    setStep(4)
    // Simulate onchain execution
    setTimeout(() => {
      toast.success('Payment confirmed! Risk fee paid.')
      setStep(5)
    }, 2000)
  }

  const steps = [
    { number: 1, title: 'Connect Wallet', action: handleConnect, cta: 'Connect Wallet', condition: !connected },
    { number: 2, title: 'View Recommendation', action: handleViewRecommendation, cta: 'Show Recommendation' },
    { number: 3, title: 'Execute Payment on Base', action: handleExecutePayment, cta: 'Pay Now' },
    { number: 4, title: 'Track Results' },
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Demo Flow Guide</h1>
        <DemoProgressBar step={step} totalSteps={5} />

        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {steps.map(s => (
              <DemoStep key={s.number} number={s.number} title={s.title} isActive={step === s.number}>
                {s.number === 2 && (
                  <p className="mb-4">Agent recommends: Pay invoice early to save 9% (avoid 12% borrowing cost).</p>
                )}
                {s.number === 3 && (
                  <p className="mb-4">Payment to Supplier Co. · 6,000 USDC</p>
                )}
                {s.number === 4 && (
                  <p className="mb-4">Processing on Base...</p>
                )}
                {s.number === 5 && (
                  <p className="text-success">✓ Payment Confirmed! Risk Fee Paid! <br /> Tx: 0x7a3...d9e2</p>
                )}
                {s.action && step === s.number && (
                  <CTAButton onClick={s.action} className="mt-4">
                    {s.cta}
                  </CTAButton>
                )}
              </DemoStep>
            ))}
          </div>

          <div className="bg-surface p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <p className="text-textSecondary">Total Balance: {balance.base} USDC</p>
            <p className="text-textSecondary">M-Pesa: {balance.mpesa} KES</p>
            <p className="text-textSecondary">Airtel: {balance.airtel} KES</p>
            {step === 2 && (
              <div className="mt-4 p-3 border border-secondary rounded">
                <p className="text-secondary">⭐ Recommendation: Pay invoice early to save 9%.</p>
              </div>
            )}
            {step === 3 && (
              <div className="mt-4 p-3 border border-warning rounded">
                <p className="text-warning">⏳ Payment in progress...</p>
              </div>
            )}
            {step === 5 && (
              <div className="mt-4 p-3 border border-success rounded">
                <p className="text-success">✅ Payment Confirmed! Risk Fee Paid!</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 bg-surface rounded disabled:opacity-50"
          >
            Previous
          </button>
          {step < 5 && (
            <button
              onClick={nextStep}
              disabled={step === 5}
              className="px-4 py-2 bg-secondary text-primary rounded disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  )
}