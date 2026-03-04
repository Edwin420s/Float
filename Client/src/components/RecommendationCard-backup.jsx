export default function RecommendationCard({ text, type = 'info', onAction, actionText }) {
  const colors = {
    positive: 'border-success text-success',
    warning: 'border-warning text-warning',
    info: 'border-secondary text-secondary',
  }
  return (
    <div className={`bg-surface border-l-4 p-4 rounded ${colors[type]}`}>
      <p className="text-sm mb-3">{text}</p>
      {onAction && (
        <button 
          onClick={onAction}
          className="bg-secondary text-primary px-4 py-2 rounded font-semibold text-sm hover:bg-opacity-90 transition"
        >
          {actionText || 'ACT NOW'}
        </button>
      )}
    </div>
  )
}