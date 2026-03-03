export default function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-surface p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="text-5xl mb-4 text-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-textSecondary leading-relaxed">{description}</p>
    </div>
  )
}