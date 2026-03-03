import { formatCurrency } from '../utils/formatters'

export default function PaymentTable({ payments }) {
  return (
    <div className="bg-surface p-4 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      {payments.map(p => (
        <div key={p.id} className="flex justify-between items-center border-b border-gray-700 py-3">
          <div>
            <p className="font-medium">{p.to}</p>
            <p className="text-textSecondary text-sm">{p.date}</p>
          </div>
          <span className="font-mono">{formatCurrency(p.amount)}</span>
        </div>
      ))}
    </div>
  )
}