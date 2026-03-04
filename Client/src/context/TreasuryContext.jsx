import { createContext, useContext, useState } from 'react'

const TreasuryContext = createContext()

export const useTreasury = () => useContext(TreasuryContext)

export const TreasuryProvider = ({ children }) => {
  const [allocation, setAllocation] = useState({
    reserve: 50,
    operations: 30,
    growth: 20,
  })
  const [rules, setRules] = useState([
    { id: 1, condition: 'Balance > 50000', action: 'Move 20% to reserve' },
  ])
  const [recommendations, setRecommendations] = useState([
    { id: 1, text: 'Pay invoice early to save 9%', type: 'positive' },
  ])

  const updateAllocation = (newAlloc) => setAllocation(newAlloc)
  const addRule = (rule) => setRules([...rules, { id: Date.now(), ...rule }])
  const removeRule = (id) => setRules(rules.filter(r => r.id !== id))

  return (
    <TreasuryContext.Provider value={{
      allocation, updateAllocation,
      rules, addRule, removeRule,
      recommendations
    }}>
      {children}
    </TreasuryContext.Provider>
  )
}