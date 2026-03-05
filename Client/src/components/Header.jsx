import { NavLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'

export default function Header() {
  const { connected, address, selectedWallet, openWalletModal, disconnect } = useWallet()

  return (
    <header className="bg-surface border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-sm">F</span>
          </div>
          <span className="text-xl font-bold">Float</span>
          <span className="text-textSecondary text-sm">by Quiet Capital</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm transition ${isActive ? 'text-secondary' : 'text-textSecondary hover:text-white'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/treasury"
            className={({ isActive }) =>
              `text-sm transition ${isActive ? 'text-secondary' : 'text-textSecondary hover:text-white'}`
            }
          >
            Treasury
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `text-sm transition ${isActive ? 'text-secondary' : 'text-textSecondary hover:text-white'}`
            }
          >
            Transactions
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `text-sm transition ${isActive ? 'text-secondary' : 'text-textSecondary hover:text-white'}`
            }
          >
            Settings
          </NavLink>
          <NavLink
            to="/demo"
            className={({ isActive }) =>
              `text-sm transition ${isActive ? 'text-secondary' : 'text-textSecondary hover:text-white'}`
            }
          >
            Demo
          </NavLink>
        </nav>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          {connected ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {selectedWallet && <span className="text-lg">{selectedWallet.icon}</span>}
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-textSecondary">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="text-textSecondary hover:text-white text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
