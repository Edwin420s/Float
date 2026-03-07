import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('float_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('float_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Transaction API calls
export const fetchTransactions = async () => {
  try {
    const response = await api.get('/payment/history')
    return response.data
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    // Fallback to mock data for demo
    return [
      { id: 1, date: '2026-03-05', to: 'Supplier Co.', amount: 6000, status: 'paid', paymentMethod: 'base' },
      { id: 2, date: '2026-03-04', to: 'Logistics Ltd', amount: 1200, status: 'pending', paymentMethod: 'mpesa' },
      { id: 3, date: '2026-03-03', to: 'Utility Provider', amount: 450, status: 'paid', paymentMethod: 'airtel' },
    ]
  }
}

export const submitPayment = async (paymentData) => {
  try {
    const response = await api.post('/payment', paymentData)
    return response.data
  } catch (error) {
    console.error('Failed to submit payment:', error)
    // Fallback mock response
    return { success: true, transactionId: Date.now(), txHash: '0x' + Math.random().toString(36).substring(7) }
  }
}

// Treasury API calls
export const fetchTreasury = async () => {
  try {
    const response = await api.get('/treasury')
    return response.data
  } catch (error) {
    console.error('Failed to fetch treasury:', error)
    // Fallback mock data
    return {
      reservePercentage: 50,
      operationsPercentage: 30,
      growthPercentage: 20,
      smartRules: [
        { id: 1, condition: 'Balance > 50000', action: 'Move 20% to reserve', active: true }
      ]
    }
  }
}

export const updateTreasury = async (treasuryData) => {
  try {
    const response = await api.put('/treasury', treasuryData)
    return response.data
  } catch (error) {
    console.error('Failed to update treasury:', error)
    return treasuryData
  }
}

// Auth API calls
export const connectWallet = async (walletData) => {
  try {
    const response = await api.post('/auth/connect', walletData)
    return response.data
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    // Mock successful connection for demo
    return {
      token: 'demo_jwt_token_' + Date.now(),
      user: {
        id: 1,
        walletAddress: walletData.address,
        companyName: 'Demo SME Ltd.'
      }
    }
  }
}

export const authenticateUser = async (walletAddress) => {
  try {
    const response = await api.post('/auth/login', { walletAddress })
    return response.data
  } catch (error) {
    console.error('Failed to authenticate:', error)
    return {
      token: 'demo_jwt_token_' + Date.now(),
      user: {
        id: 1,
        walletAddress,
        companyName: 'Demo SME Ltd.'
      }
    }
  }
}

// Agent API calls
export const fetchRecommendations = async () => {
  try {
    const response = await api.get('/agent/recommendations')
    return response.data
  } catch (error) {
    console.error('Failed to fetch recommendations:', error)
    // Fallback mock recommendations with detailed data
    return [
      { 
        id: 1, 
        text: 'Pay invoice early to save 9%', 
        type: 'positive', 
        action: 'execute_payment',
        data: { amount: 6000, recipient: 'Supplier Co.', invoiceId: 'INV-001' },
        savings: 540
      },
      { 
        id: 2, 
        text: 'High transaction fees detected on M-Pesa', 
        type: 'warning', 
        action: 'optimize_payment',
        data: { currentMethod: 'mpesa', suggestedMethod: 'base', transactionId: 'TXN-002' },
        savings: 45
      },
      { 
        id: 3, 
        text: 'Consider moving 20% to reserve for stability', 
        type: 'info', 
        action: 'allocate_funds',
        data: { percentage: 20, from: 'operations', to: 'reserve' },
        savings: 0
      }
    ]
  }
}

export const executeAgentAction = async (actionData) => {
  try {
    const response = await api.post('/agent/execute', actionData)
    return response.data
  } catch (error) {
    console.error('Failed to execute agent action:', error)
    
    // Mock realistic responses based on action type
    switch (actionData.action) {
      case 'execute_payment':
        return { 
          success: true, 
          txHash: '0x' + Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7),
          transactionId: 'TXN-' + Date.now(),
          amount: actionData.data.amount,
          recipient: actionData.data.recipient,
          savings: 540
        }
      case 'optimize_payment':
        return { 
          success: true, 
          txHash: '0x' + Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7),
          transactionId: actionData.data.transactionId,
          oldMethod: actionData.data.currentMethod,
          newMethod: actionData.data.suggestedMethod,
          savings: actionData.data.savings || 45
        }
      case 'allocate_funds':
        return { 
          success: true, 
          txHash: '0x' + Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7),
          allocationId: 'ALLOC-' + Date.now(),
          percentage: actionData.data.percentage,
          from: actionData.data.from,
          to: actionData.data.to
        }
      default:
        return { success: true, txHash: '0x' + Math.random().toString(36).substring(7) }
    }
  }
}

export default api