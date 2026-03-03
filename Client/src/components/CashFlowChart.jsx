import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Mon', inflow: 4000, outflow: 2400 },
  { name: 'Tue', inflow: 3000, outflow: 1398 },
  { name: 'Wed', inflow: 2000, outflow: 9800 },
  { name: 'Thu', inflow: 2780, outflow: 3908 },
  { name: 'Fri', inflow: 1890, outflow: 4800 },
  { name: 'Sat', inflow: 2390, outflow: 3800 },
  { name: 'Sun', inflow: 3490, outflow: 4300 },
]

export default function CashFlowChart() {
  return (
    <div className="bg-surface p-4 rounded-xl shadow-lg h-64">
      <h3 className="text-lg font-semibold mb-2">Cash Flow (last 7 days)</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
          <XAxis dataKey="name" stroke="#CBD5E1" />
          <YAxis stroke="#CBD5E1" />
          <Tooltip contentStyle={{ backgroundColor: '#1C2747', border: 'none' }} />
          <Line type="monotone" dataKey="inflow" stroke="#34D399" strokeWidth={2} />
          <Line type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}