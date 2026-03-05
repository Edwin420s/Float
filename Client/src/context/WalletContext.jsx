import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { connectWallet, authenticateUser } from '../utils/api'

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
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    
    try {
      let walletAddress = null
      
      if (wallet.provider) {
        // Real wallet connection
        if (wallet.id.includes('metamask') || wallet.id.includes('coinbase') || wallet.id.includes('walletconnect')) {
          // Ethereum wallet connection
          const accounts = await wallet.provider.request({ 
            method: 'eth_requestAccounts' 
          })
          walletAddress = accounts[0]
        }
      } else {
        // Demo wallet connection
        walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      }
      
      if (walletAddress) {
        // Authenticate with backend
        const authData = await connectWallet({
          address: walletAddress,
          walletType: wallet.id,
          timestamp: Date.now()
        })
        
        // Store token
        localStorage.setItem('float_token', authData.token)
        
        // Update state
        setAddress(walletAddress)
        setConnected(true)
        
        toast.success(`${wallet.name} connected successfully`)
        
        // Redirect to dashboard
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      toast.error('Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setConnected(false)
    setSelectedWallet(null)
    localStorage.removeItem('float_token')
    toast.info('Wallet disconnected')
    navigate('/')
  }

  const refreshBalance = async () => {
    // In a real implementation, this would fetch from blockchain
    setBalance({
      base: Math.floor(Math.random() * 20000) + 10000,
      mpesa: Math.floor(Math.random() * 50000) + 30000,
      airtel: Math.floor(Math.random() * 40000) + 20000,
    })
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
      loading,
      showWalletModal,
      detectWallets,
      connect,
      disconnect,
      refreshBalance,
      openWalletModal,
      closeWalletModal
    }}>
      {children}
    </WalletContext.Provider>
  )
}