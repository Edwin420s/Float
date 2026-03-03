import { useWallet } from '../context/WalletContext'
import CTAButton from './CTAButton'

export default function WalletCard() {
  const { address, connected, connect, disconnect } = useWallet()

  if (!connected) {
    return (
      <div className="bg-surface p-4 rounded-xl text-center">
        <p className="mb-4">Connect your wallet to start</p>
        <CTAButton onClick={connect}>Connect Wallet</CTAButton>
      </div>
    )
  }

  return (
    <div className="bg-surface p-4 rounded-xl">
      <p className="text-textSecondary mb-1">Connected</p>
      <p className="font-mono text-sm mb-4">{address.slice(0,6)}...{address.slice(-4)}</p>
      <button onClick={disconnect} className="text-error hover:underline text-sm">Disconnect</button>
    </div>
  )
}