import { createContext, useContext, useState } from 'react'
import { toast } from 'react-toastify'

const WalletContext = createContext()

export const useWallet = () => useContext(WalletContext)

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState({
    base: 12300, // USDC
    mpesa: 45000, // KES
    airtel: 32000, // KES
  })
  const [connected, setConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)

  // Detect available wallet extensions
  const detectWallets = () => {
    const wallets = []
    
    // MetaMask
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      wallets.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        provider: window.ethereum
      })
    }
    
    // Coinbase Wallet
    if (typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet) {
      wallets.push({
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        provider: window.ethereum
      })
    }
    
    // WalletConnect
    if (typeof window !== 'undefined' && window.ethereum?.isWalletConnect) {
      wallets.push({
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        provider: window.ethereum
      })
    }
    
    // Phantom (Solana)
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      wallets.push({
        id: 'phantom',
        name: 'Phantom',
        icon: '👻',
        provider: window.solana
      })
    }
    
    // Add mock wallets for demo if no real wallets detected
    if (wallets.length === 0) {
      wallets.push(
        {
          id: 'metamask-demo',
          name: 'MetaMask (Demo)',
          icon: '🦊',
          provider: null
        },
        {
          id: 'coinbase-demo',
          name: 'Coinbase Wallet (Demo)',
          icon: '🔵',
          provider: null
        },
        {
          id: 'walletconnect-demo',
          name: 'WalletConnect (Demo)',
          icon: '🔗',
          provider: null
        }
      )
    }
    
    return wallets
  }

  const connect = async (walletId) => {
    const wallets = detectWallets()
    const wallet = wallets.find(w => w.id === walletId)
    
    if (!wallet) {
      toast.error('Wallet not found')
      return
    }
    
    setSelectedWallet(wallet)
    setShowWalletModal(false)
    
    try {
      if (wallet.provider) {
        // Real wallet connection
        if (wallet.id === 'phantom') {
          // Solana wallet connection
          const response = await wallet.provider.connect()
          setAddress(response.publicKey.toString())
        } else {
          // Ethereum wallet connection
          const accounts = await wallet.provider.request({ 
            method: 'eth_requestAccounts' 
          })
          setAddress(accounts[0])
        }
      } else {
        // Demo wallet connection
        setTimeout(() => {
          setAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
        }, 1000)
      }
      
      setConnected(true)
      toast.success(`${wallet.name} connected`)
    } catch (error) {
      console.error('Wallet connection error:', error)
      toast.error('Failed to connect wallet')
    }
  }

  const disconnect = () => {
    setAddress(null)
    setConnected(false)
    setSelectedWallet(null)
    toast.info('Wallet disconnected')
  }

  const openWalletModal = () => {
    setShowWalletModal(true)
  }

  const closeWalletModal = () => {
    setShowWalletModal(false)
  }

  return (
    <WalletContext.Provider value={{ 
      address, 
      balance, 
      connected, 
      selectedWallet,
      showWalletModal,
      detectWallets,
      connect,
      disconnect,
      openWalletModal,
      closeWalletModal
    }}>
      {children}
    </WalletContext.Provider>
  )
}