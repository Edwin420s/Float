import { useState } from 'react'

export default function NotificationToggle({ label, defaultChecked = false }) {
  const [enabled, setEnabled] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between py-2">
      <span>{label}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full p-1 transition ${enabled ? 'bg-secondary' : 'bg-gray-600'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transform transition ${enabled ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  )
}