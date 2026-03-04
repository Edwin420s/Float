import { useWallet } from '../context/WalletContext'
import { useTreasury } from '../context/TreasuryContext'
import AllocationSlider from '../components/AllocationSlider'
import RuleCard from '../components/RuleCard'
import ExecuteButton from '../components/ExecuteButton'
import CTAButton from '../components/CTAButton'
import { toast } from 'react-toastify'

export default function Treasury() {
  const { allocation, updateAllocation, rules, removeRule } = useTreasury()

  const handlePreview = () => {
    toast.info('Previewing treasury allocation changes...')
  }

  const handleExecute = async () => {
    // Simulate treasury action
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Treasury allocation executed successfully!')
    console.log('Treasury executed')
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Treasury Management</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Treasury Allocation</h2>
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

      <div className="mt-8 flex gap-4">
        <CTAButton onClick={handlePreview}>Preview Changes</CTAButton>
        <ExecuteButton onClick={handleExecute}>Execute Treasury Allocation</ExecuteButton>
      </div>
    </main>
  )
}