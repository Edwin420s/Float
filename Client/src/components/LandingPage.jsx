import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import HeroSection from '../components/HeroSection'
import FeatureCard from '../components/FeatureCard'
import Footer from '../components/Footer'

export default function LandingPage() {
  const { connect } = useWallet()
  const navigate = useNavigate()

  const handleConnect = async () => {
    await connect()
    navigate('/dashboard')
  }

  return (
    <div>
      <HeroSection onConnect={handleConnect} />
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon="📊"
          title="Monitor Balances"
          description="Unified view of all your wallets: Base, M-Pesa, Airtel, and more."
        />
        <FeatureCard
          icon="⚡"
          title="Optimize Cashflow"
          description="AI-powered recommendations to reduce costs and improve liquidity."
        />
        <FeatureCard
          icon="🤖"
          title="Automate Payments"
          description="Autonomous execution of supplier payments and treasury moves."
        />
      </section>
      <Footer />
    </div>
  )
}