import { useState } from 'react'
import CTAButton from './CTAButton'

export default function ApprovalModal({ isOpen, onClose, onApprove, transaction }) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(transaction)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface p-6 rounded-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Approve Transaction</h2>
        <p className="mb-2">To: {transaction?.to}</p>
        <p className="mb-4">Amount: {transaction?.amount} USD</p>
        <p className="text-textSecondary mb-6">Fee: 0.01 USD</p>
        <div className="flex gap-4">
          <CTAButton onClick={handleApprove} disabled={loading}>
            {loading ? 'Approving...' : 'Approve'}
          </CTAButton>
          <button onClick={onClose} className="px-4 py-2 border border-gray-600 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  )
}