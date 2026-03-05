import { useWallet } from '../context/WalletContext'

export default function WalletModal() {
  const { showWalletModal, closeWalletModal, detectWallets, connect } = useWallet()
  
  if (!showWalletModal) return null
  
  const wallets = detectWallets()
  
  const handleWalletSelect = (walletId) => {
    connect(walletId)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <button
            onClick={closeWalletModal}
            className="text-textSecondary hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <p className="text-textSecondary mb-6">
          Choose your wallet provider to connect to Float
        </p>
        
        <div className="space-y-3 mb-6">
          {wallets.map(wallet => (
            <button
              key={wallet.id}
              onClick={() => handleWalletSelect(wallet.id)}
              className="w-full bg-primary hover:bg-opacity-80 p-4 rounded-lg flex items-center space-x-4 transition hover:bg-opacity-90"
            >
              <div className="text-2xl">{wallet.icon}</div>
              <div className="text-left flex-1">
                <p className="font-semibold">{wallet.name}</p>
                {wallet.provider ? (
                  <p className="text-success text-sm">Available</p>
                ) : (
                  <p className="text-textSecondary text-sm">Demo Mode</p>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          <div className="mb-4">
            <p className="text-textSecondary text-sm mb-2">
              Detected {wallets.filter(w => w.provider).length} real wallet(s)
            </p>
            {wallets.filter(w => w.provider).length === 0 && (
              <p className="text-warning text-sm">
                No wallet extensions detected. Install a wallet to use real functionality.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-textSecondary text-sm">
              Don't have a wallet? 
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline ml-1">
                Install MetaMask
              </a>
            </p>
            <p className="text-textSecondary text-xs">
              Supported: MetaMask, Coinbase, Trust, Phantom, Rainbow, Frame, XDEFI, Exodus, MathWallet, SafePal, Zengo, Atomic, Ledger, Trezor and more
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
