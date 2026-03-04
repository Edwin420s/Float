import { useWallet } from '../context/WalletContext'
import { useTreasury } from '../context/TreasuryContext'
import { useFetchTransactions } from '../hooks/useFetchTransactions'
import BalanceCard from '../components/BalanceCard'
import CashFlowChart from '../components/CashFlowChart'
import TransactionTable from '../components/TransactionTable'
import RecommendationCard from '../components/RecommendationCard'
import WalletCard from '../components/WalletCard'
import { toast } from 'react-toastify'

export default function Dashboard() {
  const { balance } = useWallet()
  const { recommendations } = useTreasury()
  const { transactions, loading } = useFetchTransactions()

  const handleActNow = () => {
    toast.success('Executing payment optimization...')
    // Simulate agent action
    setTimeout(() => {
      toast.success('Payment scheduled! You\'ll save 9% on this invoice.')
    }, 2000)
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
      <p className="text-textSecondary mb-6">Here's your financial overview</p>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <BalanceCard baseBalance={balance.base} mpesa={balance.mpesa} airtel={balance.airtel} />
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionTable transactions={transactions} loading={loading} />
        </div>
        <div>
          <WalletCard />
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">Agent Recommendations</h3>
            {recommendations.map(rec => (
              <RecommendationCard 
                key={rec.id} 
                text={rec.text} 
                type={rec.type}
                onAction={rec.type === 'positive' ? handleActNow : null}
                actionText="ACT NOW"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}