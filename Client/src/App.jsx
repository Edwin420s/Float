import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { TreasuryProvider } from './context/TreasuryContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Header from './components/Header'
import Sidebar from './components/Sidebar'

// Pages
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Treasury from './pages/Treasury'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import DemoFlow from './pages/DemoFlow'

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <TreasuryProvider>
          <div className="min-h-screen bg-primary text-white">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/treasury" element={<Treasury />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/demo" element={<DemoFlow />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
            <ToastContainer position="bottom-right" theme="dark" />
          </div>
        </TreasuryProvider>
      </WalletProvider>
    </BrowserRouter>
  )
}

export default App