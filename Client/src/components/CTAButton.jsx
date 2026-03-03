export default function CTAButton({ children, onClick, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-secondary text-primary font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}