import { formatCurrency } from '../utils/formatters'

export default function PaymentTable({ payments }) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      {payments.map(p => (
        <div key={p.id} className="flex justify-between items-center border-b border-gray-700 py-3">
          <div>
            <p className="font-medium">{p.to}</p>
            <p className="text-textSecondary text-sm">{p.date}</p>
          </div>
          <div className="text-right">
            <p className="font-mono">{formatCurrency(p.amount)}</p>
            {p.status === 'paid' && (
              <p className="text-success text-sm">Paid: {formatCurrency(0.01)}</p>
            )}
            {p.status === 'pending' && (
              <button className="text-secondary hover:underline text-sm">Approve Payment Fee: {formatCurrency(0.01)}</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}