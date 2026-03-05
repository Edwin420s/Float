import { formatCurrency, formatKES } from '../utils/formatters'

export default function BalanceCard({ baseBalance, mpesa, airtel }) {
  return (
    <div className="bg-surface p-8 rounded-xl shadow-lg">
      <h2 className="text-lg text-textSecondary mb-4">Total Balance</h2>
      <p className="text-5xl font-bold mb-6">${new Intl.NumberFormat('en-US').format(baseBalance)} USDC</p>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-primary rounded-lg">
          <span className="font-medium">M-Pesa</span>
          <span className="font-mono text-lg">{formatKES(mpesa)} KES</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-primary rounded-lg">
          <span className="font-medium">Airtel</span>
          <span className="font-mono text-lg">{formatKES(airtel)} KES</span>
        </div>
      </div>
    </div>
  )
}
