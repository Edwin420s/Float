import { formatCurrency, formatKES } from '../utils/formatters'

export default function BalanceCard({ baseBalance, mpesa, airtel }) {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg">
      <h2 className="text-lg text-textSecondary mb-2">Total Balance</h2>
      <p className="text-4xl font-bold mb-4">{formatCurrency(baseBalance, 'USDc')}</p>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>M-Pesa</span>
          <span className="font-mono">{formatKES(mpesa)}</span>
        </div>
        <div className="flex justify-between">
          <span>Airtel</span>
          <span className="font-mono">{formatKES(airtel)}</span>
        </div>
      </div>
    </div>
  )
}