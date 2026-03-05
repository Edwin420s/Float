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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
        <p className="text-textSecondary text-lg">Here's your financial overview</p>
      </div>

      {/* Top Section - Balance and Cash Flow */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div>
          <BalanceCard baseBalance={balance.base} mpesa={balance.mpesa} airtel={balance.airtel} />
        </div>
        <div>
          <CashFlowChart />
        </div>
      </div>

      {/* Bottom Section - Transactions and Recommendations */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <TransactionTable transactions={transactions} loading={loading} />
        </div>
        <div className="space-y-6">
          <WalletCard />
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Agent Recommendations</h3>
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
