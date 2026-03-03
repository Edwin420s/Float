module.exports = {
  SUPPORTED_CURRENCIES: ['USDC', 'KES'],
  PAYMENT_METHODS: ['base', 'mpesa', 'airtel', 'mtn', 'x402'],
  DEFAULT_TREASURY_RULES: [
    { condition: 'balance > 50000', action: 'move 20% to reserve' },
  ],
};