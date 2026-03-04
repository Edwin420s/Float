import { formatCurrency, formatKES } from '../utils/formatters'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const balanceData = [
  { day: 'Mon', balance: 12000 },
  { day: 'Tue', balance: 12300 },
  { day: 'Wed', balance: 12100 },
  { day: 'Thu', balance: 12300 },
  { day: 'Fri', balance: 12200 },
  { day: 'Sat', balance: 12300 },
  { day: 'Sun', balance: 12300 },
]

export default function BalanceCard({ baseBalance, mpesa, airtel }) {
  return (
    <div className="bg-surface p-8 rounded-xl shadow-lg">
      <h2 className="text-lg text-textSecondary mb-4">Total Balance</h2>
      
      {/* Balance Line Chart */}
      <div className="h-32 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={balanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
            <XAxis dataKey="day" stroke="#CBD5E1" tick={{ fontSize: 10 }} />
            <YAxis stroke="#CBD5E1" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1C2747', border: 'none' }} />
            <Line type="monotone" dataKey="balance" stroke="#4FC3F7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
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
