import { formatCurrency } from '../utils/formatters'

export default function TransactionTable({ transactions, loading }) {
  if (loading) return <p className="text-textSecondary">Loading...</p>
  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      {transactions.map(tx => (
        <div key={tx.id} className="flex justify-between items-center border-b border-gray-700 py-3">
          <div>
            <p className="font-medium">{tx.to}</p>
            <p className="text-textSecondary text-sm">{tx.date}</p>
          </div>
          <div className="text-right">
            <p className="font-mono">{formatCurrency(tx.amount)}</p>
            {tx.status === 'paid' && (
              <p className="text-success text-sm">Paid: {formatCurrency(0.01)}</p>
            )}
            {tx.status === 'pending' && (
              <button className="text-secondary hover:underline text-sm">Approve Payment Fee: {formatCurrency(0.01)}</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}