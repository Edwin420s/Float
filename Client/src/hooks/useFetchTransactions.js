import { useState, useEffect } from 'react'
import { fetchTransactions } from '../utils/api'

export const useFetchTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransactions()
      .then(data => {
        setTransactions(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return { transactions, loading, error }
}