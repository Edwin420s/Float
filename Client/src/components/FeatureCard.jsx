export default function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-textSecondary">{description}</p>
    </div>
  )
}