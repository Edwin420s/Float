export default function RuleCard({ rule, onDelete }) {
  return (
    <div className="bg-primary p-4 rounded-lg flex justify-between items-center">
      <span>IF {rule.condition} THEN {rule.action}</span>
      <button onClick={() => onDelete(rule.id)} className="text-error hover:opacity-80">✕</button>
    </div>
  )
}