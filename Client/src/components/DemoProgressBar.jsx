export default function DemoProgressBar({ step, totalSteps = 5 }) {
  const progress = (step / totalSteps) * 100
  return (
    <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
      <div className="bg-secondary h-2 transition-all" style={{ width: `${progress}%` }} />
    </div>
  )
}