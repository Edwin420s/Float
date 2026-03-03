require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  blockchain: {
    baseRpcUrl: process.env.BASE_RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    smartWalletFactory: process.env.COINBASE_SMART_WALLET_FACTORY,
    usdcAddress: process.env.USDC_ADDRESS || '0x...', // Base Sepolia USDC
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
  x402: {
    receiverUrl: process.env.X402_RECEIVER_URL || 'http://localhost:5000/api/payment/x402',
  },
};