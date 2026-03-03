import CTAButton from './CTAButton'

export default function HeroSection({ onConnect }) {
  return (
    <div className="text-center py-16 px-4">
      {/* Logo and Title */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
            <span className="text-primary font-bold text-lg">F</span>
          </div>
          <div className="text-left">
            <h1 className="text-5xl font-bold mb-2">Float</h1>
            <p className="text-2xl text-textSecondary">by Quiet Capital</p>
          </div>
        </div>
      </div>

      {/* Main Tagline */}
      <p className="text-3xl max-w-4xl mx-auto mb-12 leading-tight">
        Automate Your SME Treasury — Optimize Liquidity. Make Intelligent Payments.
      </p>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <span className="bg-surface px-6 py-3 rounded-full text-lg font-medium">Monitor Balances</span>
        <span className="bg-surface px-6 py-3 rounded-full text-lg font-medium">Optimize Cashflow</span>
        <span className="bg-surface px-6 py-3 rounded-full text-lg font-medium">Automate Payments</span>
      </div>

      {/* CTA Button */}
      <CTAButton onClick={onConnect} className="text-lg px-8 py-4">Connect Wallet</CTAButton>
    </div>
  )
}