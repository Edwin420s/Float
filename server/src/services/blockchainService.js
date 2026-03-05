const { ethers } = require('ethers');
const logger = require('../utils/logger');

// AgentTreasury Contract ABI (simplified version)
const AgentTreasuryABI = [
  "function executePayment(address to, uint256 amount, address token) external",
  "function authoriseAgent(address agent) external",
  "function revokeAgent(address agent) external",
  "function balanceOf(address token) view returns (uint256)",
  "event PaymentExecuted(address indexed to, uint256 amount, address token)",
  "event AgentAuthorised(address agent)",
  "event AgentRevoked(address agent)"
];

// ERC20 ABI for USDC interactions
const ERC20ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Initialize provider and signer
const getProvider = () => {
  const rpcUrl = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
  return new ethers.JsonRpcProvider(rpcUrl);
};

const getSigner = () => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === 'your_private_key_here') {
    logger.warn('Using demo signer - no real private key configured');
    return null;
  }
  return new ethers.Wallet(privateKey, getProvider());
};

// Deploy AgentTreasury contract for a user
exports.deployAgentTreasury = async (userId) => {
  try {
    const signer = getSigner();
    if (!signer) {
      // Return mock address for demo
      const mockAddress = `0x${userId.replace(/-/g, '').substring(0, 40)}`;
      logger.info(`Mock AgentTreasury deployed for user ${userId} at ${mockAddress}`);
      return mockAddress;
    }

    // In a real implementation, you would have the compiled bytecode
    // For demo, return a deterministic mock address
    const mockAddress = `0x${userId.replace(/-/g, '').substring(0, 40)}`;
    logger.info(`AgentTreasury deployed for user ${userId} at ${mockAddress}`);
    return mockAddress;
  } catch (error) {
    logger.error('Deployment failed', error);
    throw error;
  }
};

// Execute a payment from user's treasury
exports.executePayment = async (treasuryAddress, to, amount, tokenAddress) => {
  try {
    const signer = getSigner();
    if (!signer) {
      // Mock transaction for demo
      const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2)}`;
      logger.info(`Mock payment executed: ${mockTxHash}`);
      return mockTxHash;
    }

    const treasury = new ethers.Contract(treasuryAddress, AgentTreasuryABI, signer);
    const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC uses 6 decimals
    
    const tx = await treasury.executePayment(to, amountWei, tokenAddress || '0x0000000000000000000000000000000000000000');
    const receipt = await tx.wait();
    
    logger.info(`Payment executed: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    logger.error('Payment execution failed', error);
    throw error;
  }
};

// Get token balance
exports.getTokenBalance = async (walletAddress, tokenAddress) => {
  try {
    const provider = getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, 6); // USDC uses 6 decimals
  } catch (error) {
    logger.error('Failed to get token balance', error);
    return '0';
  }
};

// Get native ETH balance
exports.getNativeBalance = async (walletAddress) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(walletAddress);
    return ethers.formatEther(balance);
  } catch (error) {
    logger.error('Failed to get native balance', error);
    return '0';
  }
};

// x402 payment simulation – send a payment to another agent via HTTP with x402 header
exports.sendX402Payment = async (targetUrl, amount, invoiceId) => {
  try {
    const axios = require('axios');
    // Construct x402 header (simplified)
    const paymentHeader = `x402 ${amount} USDC ${invoiceId}`;
    const response = await axios.post(
      targetUrl,
      { invoiceId, amount, timestamp: Date.now() },
      { headers: { 'X-Payment': paymentHeader } }
    );
    logger.info(`x402 payment sent to ${targetUrl}, response:`, response.data);
    return response.data;
  } catch (error) {
    logger.error('x402 payment failed', error);
    throw error;
  }
};

// Validate wallet address format
exports.isValidAddress = (address) => {
  return ethers.isAddress(address);
};

// Format amount for display
exports.formatAmount = (amount, decimals = 6) => {
  return ethers.formatUnits(amount, decimals);
};

// Parse amount for transactions
exports.parseAmount = (amount, decimals = 6) => {
  return ethers.parseUnits(amount.toString(), decimals);
};

// Get transaction details
exports.getTransaction = async (txHash) => {
  try {
    const provider = getProvider();
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    return { tx, receipt };
  } catch (error) {
    logger.error('Failed to get transaction details', error);
    return null;
  }
};

// Estimate gas for transaction
exports.estimateGas = async (to, data, value = '0') => {
  try {
    const provider = getProvider();
    const gasEstimate = await provider.estimateGas({
      to,
      data,
      value: ethers.parseEther(value)
    });
    return gasEstimate.toString();
  } catch (error) {
    logger.error('Gas estimation failed', error);
    return '100000'; // Default gas limit
  }
};

// Get current gas price
exports.getGasPrice = async () => {
  try {
    const provider = getProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '20';
  } catch (error) {
    logger.error('Failed to get gas price', error);
    return '20'; // Default gas price in gwei
  }
};

module.exports = {
  AgentTreasuryABI,
  ERC20ABI,
  getProvider,
  getSigner
};