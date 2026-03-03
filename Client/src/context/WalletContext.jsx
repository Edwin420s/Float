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

  const connect = async () => {
    // Simulate wallet connection
    setTimeout(() => {
      setAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
      setConnected(true)
      toast.success('Wallet connected')
    }, 1000)
  }

  const disconnect = () => {
    setAddress(null)
    setConnected(false)
    toast.info('Wallet disconnected')
  }

  return (
    <WalletContext.Provider value={{ address, balance, connected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}