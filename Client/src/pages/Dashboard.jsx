import { useWallet } from '../context/WalletContext'
import { useTreasury } from '../context/TreasuryContext'
import { useFetchTransactions } from '../hooks/useFetchTransactions'
import { executeAgentAction } from '../utils/api'
import BalanceCard from '../components/BalanceCard'
import CashFlowChart from '../components/CashFlowChart'
import TransactionTable from '../components/TransactionTable'
import RecommendationCard from '../components/RecommendationCard'
import WalletCard from '../components/WalletCard'
import { toast } from 'react-toastify'

export default function Dashboard() {
  const { balance, refreshBalance } = useWallet()
  const { recommendations, completedActions, recordCompletedAction, loading: treasuryLoading } = useTreasury()
  const { transactions, loading } = useFetchTransactions()

  const handleActNow = async (recommendation) => {
    try {
      toast.loading('Executing agent action...')
      
      const result = await executeAgentAction({
        action: recommendation.action,
        data: recommendation.data
      })

      if (result.success) {
        toast.success(`Action executed! Transaction: ${result.txHash?.substring(0, 10)}...`)
        
        // Record the completed action
        recordCompletedAction(recommendation, result)
        
        // Refresh data
        refreshBalance()
        
        // Show specific success message based on action
        switch (recommendation.action) {
          case 'execute_payment':
            toast.success(`Payment of $${recommendation.data.amount} sent to ${recommendation.data.recipient}`)
            break
          case 'allocate_funds':
            toast.success('Treasury allocation updated successfully')
            break
          case 'optimize_payment':
            toast.success(`Payment method optimized - saved $${recommendation.savings}`)
            break
          default:
            toast.success('Action completed successfully')
        }
      } else {
        toast.error('Action failed')
      }
    } catch (error) {
      console.error('Agent action error:', error)
      toast.error('Failed to execute action')
    }
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
                onAction={rec.action ? () => handleActNow(rec) : null}
                actionText="ACT NOW"
                priority={rec.priority}
                savings={rec.savings}
              />
            ))}
            {treasuryLoading && (
              <div className="text-textSecondary text-center py-4">
                Loading recommendations...
              </div>
            )}
            
            {completedActions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Completed Actions</h3>
                <div className="space-y-3">
                  {completedActions.map(action => (
                    <div key={action.id} className="bg-success bg-opacity-10 border border-success rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-success">{action.text}</p>
                          <p className="text-xs text-textSecondary mt-1">
                            {new Date(action.timestamp).toLocaleString()}
                          </p>
                          {action.savings > 0 && (
                            <p className="text-xs text-success mt-1">
                              Saved: ${action.savings}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-success font-mono">
                          ✓ Done
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
