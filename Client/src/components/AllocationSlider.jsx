import { useState } from 'react'

export default function AllocationSlider({ label, value, onChange, max = 100 }) {
  const [val, setVal] = useState(value)
  const handleChange = (e) => {
    const newVal = Number(e.target.value)
    setVal(newVal)
    onChange(newVal)
  }
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className="text-secondary">{val}%</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={val}
        onChange={handleChange}
        className="w-full accent-secondary"
      />
    </div>
  )
}