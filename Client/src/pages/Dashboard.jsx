import { useWallet } from '../context/WalletContext'
import { useTreasury } from '../context/TreasuryContext'
import { useFetchTransactions } from '../hooks/useFetchTransactions'
import Sidebar from '../components/Sidebar'
import BalanceCard from '../components/BalanceCard'
import CashFlowChart from '../components/CashFlowChart'
import TransactionTable from '../components/TransactionTable'
import RecommendationCard from '../components/RecommendationCard'
import WalletCard from '../components/WalletCard'

export default function Dashboard() {
  const { balance } = useWallet()
  const { recommendations } = useTreasury()
  const { transactions, loading } = useFetchTransactions()

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
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
              <h3 className="text-lg font-semibold">Recommendations</h3>
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} text={rec.text} type={rec.type} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}