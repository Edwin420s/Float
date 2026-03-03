import { formatCurrency } from '../utils/formatters'

export default function TransactionTable({ transactions, loading }) {
  if (loading) return <p className="text-textSecondary">Loading...</p>
  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-textSecondary border-b border-gray-700">
            <th className="pb-2">Date</th>
            <th>To</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id} className="border-b border-gray-800">
              <td className="py-3">{tx.date}</td>
              <td>{tx.to}</td>
              <td>{formatCurrency(tx.amount)}</td>
              <td>
                <span className={`px-2 py-1 rounded-full text-xs ${tx.status === 'paid' ? 'bg-success bg-opacity-20 text-success' : 'bg-warning bg-opacity-20 text-warning'}`}>
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}