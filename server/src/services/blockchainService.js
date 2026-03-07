const { ethers } = require('ethers');
const treasuryContractService = require('./treasuryContractService');
const logger = require('../utils/logger');

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
      // Use treasury contract service for mock deployment
      const agentAddress = process.env.AGENT_ADDRESS || '0x0000000000000000000000000000000000000000000';
      const mockAddress = await treasuryContractService.deployTreasury(userId, agentAddress);
      logger.info(`Mock AgentTreasury deployed for user ${userId} at ${mockAddress}`);
      return mockAddress;
    }

    // Get agent address from environment or use signer address
    const agentAddress = process.env.AGENT_ADDRESS || await signer.getAddress();
    
    // Deploy through treasury contract service
    const contractAddress = await treasuryContractService.deployTreasury(userId, agentAddress);
    logger.info(`AgentTreasury deployed for user ${userId} at ${contractAddress}`);
    return contractAddress;
  } catch (error) {
    logger.error('Deployment failed', error);
    throw error;
  }
};

// Execute a payment from user's treasury using the new contract
exports.executePayment = async (treasuryAddress, to, amount, tokenAddress, invoiceId, savings = 0) => {
  try {
    // Use treasury contract service for payment execution
    const txHash = await treasuryContractService.executePayment(
      treasuryAddress,
      to,
      amount,
      tokenAddress || '0x036CbD53842c5426634e7929541eC2318f3dcF7e', // USDC on Base
      invoiceId || `inv_${Date.now()}`,
      savings
    );
    
    logger.info(`Payment executed via treasury contract: ${txHash}`);
    return txHash;
  } catch (error) {
    logger.error('Payment execution failed', error);
    throw error;
  }
};

// Get token balance using treasury contract service
exports.getTokenBalance = async (treasuryAddress, tokenAddress) => {
  try {
    const balance = await treasuryContractService.getBalance(treasuryAddress, tokenAddress);
    return balance.toString();
  } catch (error) {
    logger.error('Failed to get token balance', error);
    return '0';
  }
};

// Get native ETH balance
exports.getNativeBalance = async (treasuryAddress) => {
  try {
    const balance = await treasuryContractService.getBalance(treasuryAddress, '0x0000000000000000000000000000000000000000000');
    return balance.toString();
  } catch (error) {
    logger.error('Failed to get native balance', error);
    return '0';
  }
};

// Get treasury summary
exports.getTreasurySummary = async (treasuryAddress) => {
  try {
    return await treasuryContractService.getTreasurySummary(treasuryAddress);
  } catch (error) {
    logger.error('Failed to get treasury summary', error);
    return {
      totalBalance: 0,
      totalSavings: 0,
      paymentCount: '0',
      currentAgent: null
    };
  }
};

// Get payment details from treasury contract
exports.getPaymentDetails = async (treasuryAddress, invoiceId) => {
  try {
    return await treasuryContractService.getPayment(treasuryAddress, invoiceId);
  } catch (error) {
    logger.error('Failed to get payment details', error);
    return null;
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
    return await treasuryContractService.getTransaction(txHash);
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

// Initialize treasury contract service
exports.initializeTreasuryService = async () => {
  try {
    await treasuryContractService.initialize();
    logger.info('Treasury contract service initialized');
  } catch (error) {
    logger.error('Failed to initialize treasury contract service', error);
    throw error;
  }
};

module.exports = {
  ERC20ABI,
  getProvider,
  getSigner
};