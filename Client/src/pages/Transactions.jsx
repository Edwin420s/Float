import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { submitPayment } from '../utils/api'
import Sidebar from '../components/Sidebar'
import PaymentForm from '../components/PaymentForm'
import PaymentTable from '../components/PaymentTable'
import ApprovalModal from '../components/ApprovalModal'

const mockPending = [
  { id: 1, to: 'Supplier Co.', amount: 6000, date: '2026-02-28', status: 'pending' },
]

export default function Transactions() {
  const navigate = useNavigate()
  const { connected } = useWallet()
  const [payments, setPayments] = useState(mockPending)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)

  if (!connected) {
    navigate('/')
    return null
  }

  const handlePayment = async (data) => {
    const result = await submitPayment(data)
    if (result.success) {
      setPayments([...payments, { ...data, id: Date.now(), date: new Date().toISOString().split('T')[0], status: 'paid' }])
    }
  }

  const openApproval = (tx) => {
    setSelectedTx(tx)
    setModalOpen(true)
  }

  const handleApprove = async (tx) => {
    await submitPayment(tx)
    setPayments(payments.map(p => p.id === tx.id ? { ...p, status: 'paid' } : p))
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Transactions</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <PaymentForm onSubmit={handlePayment} />

          <div>
            <PaymentTable payments={payments} />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
              {payments.filter(p => p.status === 'pending').map(tx => (
                <div key={tx.id} className="bg-surface p-3 rounded-lg flex justify-between items-center mb-2">
                  <span>{tx.to} – {tx.amount} USD</span>
                  <button onClick={() => openApproval(tx)} className="text-secondary hover:underline">Approve</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ApprovalModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onApprove={handleApprove}
          transaction={selectedTx}
        />
      </main>
    </div>
  )
}