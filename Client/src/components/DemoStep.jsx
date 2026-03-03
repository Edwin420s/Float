export default function DemoStep({ number, title, children, isActive = false }) {
  return (
    <div className={`border-l-4 ${isActive ? 'border-secondary' : 'border-gray-700'} pl-4 py-2`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${isActive ? 'bg-secondary text-primary' : 'bg-gray-700 text-textSecondary'}`}>
          {number}
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {isActive && <div className="text-textSecondary">{children}</div>}
    </div>
  )
}