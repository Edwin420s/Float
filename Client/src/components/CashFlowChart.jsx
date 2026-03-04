import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const transactionData = [
  { name: 'Payment to Supplier', amount: 6000, fill: '#EF4444' },
  { name: 'Loan Repayment', amount: 1200, fill: '#EF4444' },
  { name: 'Deposit Received', amount: 8000, fill: '#34D399' },
]

export default function CashFlowChart() {
  return (
    <div className="bg-surface p-8 rounded-xl shadow-lg">
      <h3 className="text-2xl font-semibold mb-6">Cash Flow Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={transactionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
          <XAxis 
            dataKey="name" 
            stroke="#CBD5E1" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="#CBD5E1" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1C2747', border: 'none' }} />
          <Bar 
            dataKey="amount" 
            fill={(entry) => entry.fill}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}