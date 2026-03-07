import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { submitPayment } from '../utils/api'
import { toast } from 'react-toastify'
import PaymentForm from '../components/PaymentForm'
import PaymentTable from '../components/PaymentTable'
import ApprovalModal from '../components/ApprovalModal'

const STORAGE_KEY = 'float_transactions'
const STORAGE_KEY_PENDING = 'float_pending_transactions'

// Load from localStorage on initial load
const loadTransactions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const loadPendingTransactions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PENDING)
    return stored ? JSON.parse(stored) : [
      { id: 1, to: 'Supplier Co.', amount: 6000, date: '2026-02-28', status: 'pending' }
    ]
  } catch {
    return [
      { id: 1, to: 'Supplier Co.', amount: 6000, date: '2026-02-28', status: 'pending' }
    ]
  }
}

export default function Transactions() {
  const navigate = useNavigate()
  const { connected } = useWallet()
  const [payments, setPayments] = useState(loadPendingTransactions())
  const [completedPayments, setCompletedPayments] = useState(loadTransactions())
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(payments))
  }, [payments])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedPayments))
  }, [completedPayments])

  if (!connected) {
    navigate('/')
    return null
  }

  const handlePayment = async (data) => {
    setIsSubmitting(true)
    
    // Create instant transaction record as PENDING (not processing)
    const instantTransaction = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: 'pending', // Start as pending, not processing
      timestamp: new Date().toISOString(),
      txHash: null,
      method: data.method || 'base'
    }
    
    // Add to pending list immediately
    setPayments(prev => [...prev, instantTransaction])
    
    // Show immediate success feedback
    toast.success(`Payment of $${data.amount} to ${data.to} created! Awaiting approval.`)
    
    setIsSubmitting(false)
    // NOTE: Removed automatic processing - now requires manual approval
  }

  const openApproval = (tx) => {
    setSelectedTx(tx)
    setModalOpen(true)
  }

  const handleApprove = async (tx) => {
    // Instant approval recording
    const approvedTx = {
      ...tx,
      status: 'processing',
      approvedAt: new Date().toISOString()
    }
    
    setPayments(payments.map(p => p.id === tx.id ? approvedTx : p))
    toast.success(`Payment to ${tx.to} approved and processing...`)
    
    // Process in background
    try {
      const result = await submitPayment(tx)
      
      if (result.success) {
        const completedTx = {
          ...approvedTx,
          status: 'paid',
          txHash: result.txHash || '0x' + Math.random().toString(36).substring(7),
          completedAt: new Date().toISOString()
        }
        
        // Move from pending to completed
        setPayments(prev => prev.filter(p => p.id !== tx.id))
        setCompletedPayments(prev => [...prev, completedTx])
        
        toast.success(`Payment completed! Transaction: ${result.txHash?.substring(0, 10)}...`)
      }
    } catch (error) {
      console.error('Approval error:', error)
      toast.error('Payment processing failed, please try again')
      // Revert to pending if failed
      setPayments(payments.map(p => p.id === tx.id ? { ...p, status: 'pending' } : p))
    }
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Transactions</h1>
        <p className="text-textSecondary text-lg">Manage your payments and approvals</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <PaymentForm onSubmit={handlePayment} disabled={isSubmitting} />

        <div className="space-y-6">
          <PaymentTable payments={payments} />
          
          <div className="bg-surface p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Pending Approvals</h3>
            {payments.filter(p => p.status === 'pending').map(tx => (
              <div key={tx.id} className="bg-primary p-4 rounded-lg flex justify-between items-center mb-3">
                <span className="font-medium">{tx.to} – {tx.amount} USDC</span>
                <button 
                  onClick={() => openApproval(tx)} 
                  className="text-secondary hover:underline font-medium"
                  disabled={isSubmitting}
                >
                  Approve
                </button>
              </div>
            ))}
            
            {payments.filter(p => p.status === 'processing').map(tx => (
              <div key={tx.id} className="bg-warning bg-opacity-20 border border-warning p-4 rounded-lg flex justify-between items-center mb-3">
                <div>
                  <span className="font-medium">{tx.to} – {tx.amount} USDC</span>
                  <p className="text-xs text-textSecondary mt-1">Processing...</p>
                </div>
                <div className="text-warning font-medium text-sm">
                  ⏳ In Progress
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completed Transactions Section */}
      {completedPayments.length > 0 && (
        <div className="bg-surface p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Completed Transactions</h3>
          <div className="space-y-3">
            {completedPayments.map(tx => (
              <div key={tx.id} className="bg-success bg-opacity-10 border border-success p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-success">{tx.to} – {tx.amount} USDC</p>
                    <p className="text-xs text-textSecondary mt-1">
                      {new Date(tx.date).toLocaleDateString()} at {new Date(tx.completedAt).toLocaleTimeString()}
                    </p>
                    {tx.txHash && (
                      <p className="text-xs text-success mt-1 font-mono">
                        Tx: {tx.txHash.substring(0, 10)}...
                      </p>
                    )}
                  </div>
                  <div className="text-success font-medium text-sm">
                    ✓ Completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ApprovalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApprove={handleApprove}
        transaction={selectedTx}
      />
    </main>
  )
}
