import { createContext, useContext, useState, useEffect } from 'react'
import { fetchTreasury, updateTreasury, fetchRecommendations } from '../utils/api'

const TreasuryContext = createContext()

export const useTreasury = () => useContext(TreasuryContext)

export const TreasuryProvider = ({ children }) => {
  const [allocation, setAllocation] = useState({
    reserve: 50,
    operations: 30,
    growth: 20,
  })
  const [rules, setRules] = useState([
    { id: 1, condition: 'Balance > 50000', action: 'Move 20% to reserve', active: true },
  ])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch treasury data on mount
  useEffect(() => {
    const loadTreasuryData = async () => {
      setLoading(true)
      try {
        const treasuryData = await fetchTreasury()
        if (treasuryData) {
          setAllocation({
            reserve: treasuryData.reservePercentage || 50,
            operations: treasuryData.operationsPercentage || 30,
            growth: treasuryData.growthPercentage || 20,
          })
          setRules(treasuryData.smartRules || [])
        }
      } catch (error) {
        console.error('Failed to load treasury data:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadRecommendations = async () => {
      try {
        const recs = await fetchRecommendations()
        setRecommendations(recs)
      } catch (error) {
        console.error('Failed to load recommendations:', error)
        // Fallback recommendations
        setRecommendations([
          { id: 1, text: 'Pay invoice early to save 9%', type: 'positive', action: 'execute_payment' },
          { id: 2, text: 'High transaction fees detected on M-Pesa', type: 'warning', action: 'optimize_payment' },
        ])
      }
    }

    loadTreasuryData()
    loadRecommendations()
  }, [])

  const updateAllocation = async (newAlloc) => {
    setLoading(true)
    try {
      const treasuryData = {
        reservePercentage: newAlloc.reserve,
        operationsPercentage: newAlloc.operations,
        growthPercentage: newAlloc.growth,
      }
      
      await updateTreasury(treasuryData)
      setAllocation(newAlloc)
    } catch (error) {
      console.error('Failed to update allocation:', error)
      // Still update locally for demo
      setAllocation(newAlloc)
    } finally {
      setLoading(false)
    }
  }

  const addRule = async (rule) => {
    const newRule = { id: Date.now(), ...rule, active: true }
    const updatedRules = [...rules, newRule]
    
    try {
      await updateTreasury({
        smartRules: updatedRules
      })
      setRules(updatedRules)
    } catch (error) {
      console.error('Failed to add rule:', error)
      // Still update locally for demo
      setRules(updatedRules)
    }
  }

  const removeRule = async (id) => {
    const updatedRules = rules.filter(r => r.id !== id)
    
    try {
      await updateTreasury({
        smartRules: updatedRules
      })
      setRules(updatedRules)
    } catch (error) {
      console.error('Failed to remove rule:', error)
      // Still update locally for demo
      setRules(updatedRules)
    }
  }

  const toggleRule = async (id) => {
    const updatedRules = rules.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    )
    
    try {
      await updateTreasury({
        smartRules: updatedRules
      })
      setRules(updatedRules)
    } catch (error) {
      console.error('Failed to toggle rule:', error)
      // Still update locally for demo
      setRules(updatedRules)
    }
  }

  return (
    <TreasuryContext.Provider value={{
      allocation, 
      updateAllocation,
      rules, 
      addRule, 
      removeRule,
      toggleRule,
      recommendations,
      loading
    }}>
      {children}
    </TreasuryContext.Provider>
  )
}