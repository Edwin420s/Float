export default function RecommendationCard({ text, type = 'info' }) {
  const colors = {
    positive: 'border-success text-success',
    warning: 'border-warning text-warning',
    info: 'border-secondary text-secondary',
  }
  return (
    <div className={`bg-surface border-l-4 p-4 rounded ${colors[type]}`}>
      <p className="text-sm">{text}</p>
    </div>
  )
}