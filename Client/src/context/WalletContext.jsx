import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const WalletContext = createContext()

export const useWallet = () => useContext(WalletContext)

export const WalletProvider = ({ children }) => {
  const navigate = useNavigate()
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
    
    // Trust Wallet
    if (typeof window !== 'undefined' && window.trustwallet) {
      wallets.push({
        id: 'trustwallet',
        name: 'Trust Wallet',
        icon: '🛡️',
        provider: window.trustwallet
      })
    }
    
    // Brave Wallet (Brave browser)
    if (typeof window !== 'undefined' && window.ethereum?.isBraveWallet) {
      wallets.push({
        id: 'brave',
        name: 'Brave Wallet',
        icon: '🦁',
        provider: window.ethereum
      })
    }
    
    // Opera Wallet
    if (typeof window !== 'undefined' && window.ethereum?.isOpera) {
      wallets.push({
        id: 'opera',
        name: 'Opera Wallet',
        icon: '🎭',
        provider: window.ethereum
      })
    }
    
    // Rainbow Wallet
    if (typeof window !== 'undefined' && window.rainbow) {
      wallets.push({
        id: 'rainbow',
        name: 'Rainbow',
        icon: '🌈',
        provider: window.rainbow
      })
    }
    
    // Frame Wallet
    if (typeof window !== 'undefined' && window.frame) {
      wallets.push({
        id: 'frame',
        name: 'Frame',
        icon: '🖼️',
        provider: window.frame
      })
    }
    
    // XDEFI Wallet
    if (typeof window !== 'undefined' && window.xdefi) {
      wallets.push({
        id: 'xdefi',
        name: 'XDEFI Wallet',
        icon: '⚡',
        provider: window.xdefi
      })
    }
    
    // Exodus Wallet
    if (typeof window !== 'undefined' && window.exodus) {
      wallets.push({
        id: 'exodus',
        name: 'Exodus',
        icon: '🦋',
        provider: window.exodus
      })
    }
    
    // MathWallet
    if (typeof window !== 'undefined' && window.mathwallet) {
      wallets.push({
        id: 'mathwallet',
        name: 'MathWallet',
        icon: '🧮',
        provider: window.mathwallet
      })
    }
    
    // SafePal Wallet
    if (typeof window !== 'undefined' && window.safepal) {
      wallets.push({
        id: 'safepal',
        name: 'SafePal',
        icon: '🔐',
        provider: window.safepal
      })
    }
    
    // Zengo Wallet
    if (typeof window !== 'undefined' && window.zengo) {
      wallets.push({
        id: 'zengo',
        name: 'Zengo',
        icon: '🔑',
        provider: window.zengo
      })
    }
    
    // Atomic Wallet
    if (typeof window !== 'undefined' && window.atomicwallet) {
      wallets.push({
        id: 'atomicwallet',
        name: 'Atomic Wallet',
        icon: '⚛️',
        provider: window.atomicwallet
      })
    }
    
    // Ledger Live
    if (typeof window !== 'undefined' && window.ledgerlive) {
      wallets.push({
        id: 'ledgerlive',
        name: 'Ledger Live',
        icon: '📱',
        provider: window.ledgerlive
      })
    }
    
    // Trezor Wallet
    if (typeof window !== 'undefined' && window.trezor) {
      wallets.push({
        id: 'trezor',
        name: 'Trezor Wallet',
        icon: '🔒',
        provider: window.trezor
      })
    }
    
    // Check for multiple ethereum providers (window.ethereum array)
    if (typeof window !== 'undefined' && window.ethereum && Array.isArray(window.ethereum.providers)) {
      window.ethereum.providers.forEach((provider, index) => {
        if (provider.isMetaMask && !wallets.find(w => w.id === 'metamask')) {
          wallets.push({
            id: 'metamask',
            name: 'MetaMask',
            icon: '🦊',
            provider: provider
          })
        } else if (provider.isCoinbaseWallet && !wallets.find(w => w.id === 'coinbase')) {
          wallets.push({
            id: 'coinbase',
            name: 'Coinbase Wallet',
            icon: '🔵',
            provider: provider
          })
        } else if (provider.isBraveWallet && !wallets.find(w => w.id === 'brave')) {
          wallets.push({
            id: 'brave',
            name: 'Brave Wallet',
            icon: '🦁',
            provider: provider
          })
        } else if (provider.isOpera && !wallets.find(w => w.id === 'opera')) {
          wallets.push({
            id: 'opera',
            name: 'Opera Wallet',
            icon: '🎭',
            provider: provider
          })
        }
      })
    }
    
    // Check window.web3 for older wallets
    if (typeof window !== 'undefined' && window.web3 && window.web3.currentProvider) {
      const provider = window.web3.currentProvider
      if (provider.isMetaMask && !wallets.find(w => w.id === 'metamask')) {
        wallets.push({
          id: 'metamask',
          name: 'MetaMask (Legacy)',
          icon: '🦊',
          provider: provider
        })
      }
    }
    
    // Add demo wallets if no real wallets detected
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
        } else if (wallet.id === 'trezor' || wallet.id === 'ledgerlive') {
          // Hardware wallet connection (simplified)
          // In real implementation, you'd use specific libraries for these
          setTimeout(() => {
            setAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
            setConnected(true)
            toast.success(`${wallet.name} connected`)
            // Redirect to dashboard after successful connection
            navigate('/dashboard')
          }, 2000)
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
          setConnected(true)
          toast.success(`${wallet.name} connected`)
          // Redirect to dashboard after successful connection
          navigate('/dashboard')
        }, 1000)
      }
      
      setConnected(true)
      toast.success(`${wallet.name} connected`)
      
      // Redirect to dashboard after successful connection
      navigate('/dashboard')
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