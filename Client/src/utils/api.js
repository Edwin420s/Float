// Mock API calls – replace with real backend later
export const fetchTransactions = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, date: '2026-02-28', to: 'Supplier Co.', amount: 6000, status: 'paid' },
        { id: 2, date: '2026-02-27', to: 'Logistics Ltd', amount: 1200, status: 'pending' },
      ])
    }, 500)
  })
}

export const submitPayment = (paymentData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, txHash: '0x' + Math.random().toString(36).substring(7) })
    }, 1500)
  })
}