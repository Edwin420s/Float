export default function RecommendationCard({ text, type = 'info', onAction, actionText }) {
  const colors = {
    positive: 'border-success text-success bg-success bg-opacity-10',
    warning: 'border-warning text-warning bg-warning bg-opacity-10',
    info: 'border-secondary text-secondary bg-secondary bg-opacity-10',
  }
  
  const buttonColors = {
    positive: 'bg-success text-primary hover:bg-success hover:bg-opacity-90',
    warning: 'bg-warning text-primary hover:bg-warning hover:bg-opacity-90',
    info: 'bg-secondary text-primary hover:bg-secondary hover:bg-opacity-90',
  }
  
  return (
    <div className={`border-l-4 p-6 rounded-xl ${colors[type]} shadow-md`}>
      <p className="text-sm mb-4 leading-relaxed">{text}</p>
      {onAction && (
        <button 
          onClick={onAction}
          className={`px-6 py-2 rounded font-semibold text-sm transition ${buttonColors[type]}`}
        >
          {actionText || 'ACT NOW'}
        </button>
      )}
    </div>
  )
}
