import { useTreasury } from '../context/TreasuryContext'
import Sidebar from '../components/Sidebar'
import AllocationSlider from '../components/AllocationSlider'
import RuleCard from '../components/RuleCard'
import ExecuteButton from '../components/ExecuteButton'

export default function Treasury() {
  const { allocation, updateAllocation, rules, removeRule } = useTreasury()

  const handleExecute = async () => {
    // Simulate treasury action
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Treasury executed')
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Treasury Management</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Allocation</h2>
            <AllocationSlider
              label="Reserve"
              value={allocation.reserve}
              onChange={(val) => updateAllocation({ ...allocation, reserve: val })}
            />
            <AllocationSlider
              label="Operations"
              value={allocation.operations}
              onChange={(val) => updateAllocation({ ...allocation, operations: val })}
            />
            <AllocationSlider
              label="Growth"
              value={allocation.growth}
              onChange={(val) => updateAllocation({ ...allocation, growth: val })}
            />
          </div>

          <div className="bg-surface p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Smart Rules</h2>
            {rules.map(rule => (
              <RuleCard key={rule.id} rule={rule} onDelete={removeRule} />
            ))}
            <button className="mt-4 text-secondary hover:underline">+ Add Rule</button>
          </div>
        </div>

        <div className="mt-8">
          <ExecuteButton onClick={handleExecute}>Execute Treasury Allocation</ExecuteButton>
        </div>
      </main>
    </div>
  )
}