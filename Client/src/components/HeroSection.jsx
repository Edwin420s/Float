import CTAButton from './CTAButton'

export default function HeroSection({ onConnect }) {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-5xl font-bold mb-4">Float</h1>
      <p className="text-2xl text-textSecondary mb-8">by Quiet Capital</p>
      <p className="text-xl max-w-2xl mx-auto mb-10">
        Automate Your SME Treasury — Optimize Liquidity. Make Intelligent Payments.
      </p>
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <span className="bg-surface px-4 py-2 rounded-full">Monitor Balances</span>
        <span className="bg-surface px-4 py-2 rounded-full">Optimize Cashflow</span>
        <span className="bg-surface px-4 py-2 rounded-full">Automate Payments</span>
      </div>
      <CTAButton onClick={onConnect}>Connect Wallet</CTAButton>
    </div>
  )
}