import { useWallet } from '../context/WalletContext'
import { useTreasury } from '../context/TreasuryContext'
import AllocationSlider from '../components/AllocationSlider'
import RuleCard from '../components/RuleCard'
import ExecuteButton from '../components/ExecuteButton'
import CTAButton from '../components/CTAButton'
import { toast } from 'react-toastify'

export default function Treasury() {
  const { allocation, updateAllocation, rules, removeRule } = useTreasury()

  const handlePreviewExecute = async () => {
    toast.info('Previewing treasury allocation changes...')
    // Simulate preview
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Preview complete! Executing treasury allocation...')
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Treasury allocation executed successfully!')
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Treasury Management</h1>
        <p className="text-textSecondary text-lg">Optimize your capital allocation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-surface p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Treasury Allocation</h2>
          <div className="space-y-6">
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
        </div>

        <div className="bg-surface p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Smart Rules</h2>
          <div className="space-y-4 mb-6">
            {rules.map(rule => (
              <RuleCard key={rule.id} rule={rule} onDelete={removeRule} />
            ))}
          </div>
          <button className="text-secondary hover:underline font-medium">+ Add Rule</button>
        </div>
      </div>

      <div className="flex gap-6">
        <CTAButton onClick={handlePreviewExecute} className="px-8 py-3">Preview & Execute</CTAButton>
      </div>
    </main>
  )
}
