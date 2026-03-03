export const MOBILE_MONEY_OPTIONS = [
  { id: 'mpesa', name: 'M-Pesa', currency: 'KES' },
  { id: 'airtel', name: 'Airtel Money', currency: 'KES' },
  { id: 'mtn', name: 'MTN Mobile Money', currency: 'UGX' },
]

export const PAYMENT_METHODS = [
  { id: 'base', name: 'Base (USDC)', icon: '💰' },
  ...MOBILE_MONEY_OPTIONS.map(m => ({ id: m.id, name: m.name, icon: '📱' })),
]