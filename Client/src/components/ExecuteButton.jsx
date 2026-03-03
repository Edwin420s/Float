import { useState } from 'react'
import { toast } from 'react-toastify'
import CTAButton from './CTAButton'

export default function ExecuteButton({ onClick, children }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onClick()
      toast.success('Execution completed')
    } catch (e) {
      toast.error('Execution failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CTAButton onClick={handleClick} disabled={loading}>
      {loading ? 'Processing...' : children}
    </CTAButton>
  )
}