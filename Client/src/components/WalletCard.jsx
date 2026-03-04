import { useWallet } from '../context/WalletContext'
import CTAButton from './CTAButton'

export default function WalletCard() {
  const { address, connected, connect, disconnect } = useWallet()

  if (!connected) {
    return (
      <div className="bg-surface p-6 rounded-xl shadow-lg text-center">
        <div className="mb-4">
          <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-secondary text-xl">🔗</span>
          </div>
          <p className="text-textSecondary">Connect your wallet to start</p>
        </div>
        <CTAButton onClick={connect} className="w-full">Connect Wallet</CTAButton>
      </div>
    )
  }

  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Wallet Status</h3>
        <div className="w-3 h-3 bg-success rounded-full"></div>
      </div>
      <p className="text-textSecondary mb-2">Connected</p>
      <p className="font-mono text-sm mb-4 p-3 bg-primary rounded">{address.slice(0,6)}...{address.slice(-4)}</p>
      <button onClick={disconnect} className="text-error hover:underline text-sm font-medium">Disconnect</button>
    </div>
  )
}
