#!/usr/bin/env node

/**
 * Float - End-to-End Testing Script
 * Tests all major functionality for JengaHacks 2026 demo
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const testWallet = {
  address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  walletType: 'metamask-demo',
  companyName: 'Test SME Ltd.',
  email: 'test@float.com'
};

let authToken = null;
let userId = null;

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'SUCCESS');
const logError = (message) => log(`❌ ${message}`, 'ERROR');
const logStep = (message) => log(`🔄 ${message}`, 'STEP');

// API client with auth
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test functions
async function testHealthCheck() {
  logStep('Testing server health check...');
  try {
    const response = await api.get('/health', { baseURL: 'http://localhost:5000' });
    if (response.data === 'OK') {
      logSuccess('Server is healthy');
      return true;
    }
    throw new Error('Health check failed');
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testWalletConnection() {
  logStep('Testing wallet connection...');
  try {
    const response = await api.post('/auth/connect', testWallet);
    
    if (response.data.token && response.data.user) {
      authToken = response.data.token;
      userId = response.data.user.id;
      logSuccess(`Wallet connected: ${testWallet.address}`);
      logSuccess(`User created: ${response.data.user.companyName}`);
      return true;
    }
    throw new Error('Invalid response from wallet connection');
  } catch (error) {
    logError(`Wallet connection failed: ${error.message}`);
    return false;
  }
}

async function testTreasuryCreation() {
  logStep('Testing treasury creation...');
  try {
    const response = await api.get('/treasury');
    
    if (response.data.reservePercentage && response.data.operationsPercentage) {
      logSuccess(`Treasury created with allocation: ${response.data.reservePercentage}% reserve, ${response.data.operationsPercentage}% operations`);
      return true;
    }
    throw new Error('Invalid treasury response');
  } catch (error) {
    logError(`Treasury creation failed: ${error.message}`);
    return false;
  }
}

async function testAgentRecommendations() {
  logStep('Testing agent recommendations...');
  try {
    const response = await api.get('/agent/recommendations');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const recommendation = response.data[0];
      logSuccess(`Generated ${response.data.length} recommendations`);
      logSuccess(`Top recommendation: ${recommendation.text} (${recommendation.type})`);
      return { recommendations: response.data, topRecommendation: recommendation };
    }
    throw new Error('No recommendations generated');
  } catch (error) {
    logError(`Agent recommendations failed: ${error.message}`);
    return null;
  }
}

async function testPaymentExecution(recommendation) {
  logStep('Testing payment execution...');
  try {
    if (!recommendation || !recommendation.data) {
      throw new Error('No payment recommendation available');
    }

    const response = await api.post('/agent/execute', {
      action: recommendation.action,
      data: recommendation.data
    });

    if (response.data.success) {
      logSuccess(`Payment executed: ${response.data.txHash}`);
      logSuccess(`Amount: $${recommendation.data.amount} to ${recommendation.data.recipient}`);
      return true;
    }
    throw new Error('Payment execution failed');
  } catch (error) {
    logError(`Payment execution failed: ${error.message}`);
    return false;
  }
}

async function testPaymentHistory() {
  logStep('Testing payment history...');
  try {
    const response = await api.get('/payment/history');
    
    if (Array.isArray(response.data)) {
      logSuccess(`Retrieved ${response.data.length} transactions`);
      response.data.forEach(tx => {
        logSuccess(`Transaction: ${tx.amount} ${tx.currency} to ${tx.recipient} (${tx.status})`);
      });
      return true;
    }
    throw new Error('Invalid payment history response');
  } catch (error) {
    logError(`Payment history failed: ${error.message}`);
    return false;
  }
}

async function testX402Payment() {
  logStep('Testing x402 payment system...');
  try {
    // Test receiving x402 payment
    const x402Payload = {
      amount: 100,
      fromAgent: 'test-agent',
      invoiceId: 'inv_x402_001',
      serviceType: 'analytics'
    };

    const response = await api.post('/payment/x402', x402Payload, {
      headers: {
        'X-Payment': 'x402 100 USDC inv_x402_001',
        'X-Payment-Digest': '0x1234567890abcdef'
      }
    });

    if (response.data.received) {
      logSuccess(`x402 payment received: ${response.data.transactionId}`);
      logSuccess(`Amount: ${response.data.amount} ${response.data.currency}`);
      return true;
    }
    throw new Error('x402 payment not received');
  } catch (error) {
    logError(`x402 payment test failed: ${error.message}`);
    return false;
  }
}

async function testTreasuryAllocation() {
  logStep('Testing treasury allocation...');
  try {
    const newAllocation = {
      reservePercentage: 40,
      operationsPercentage: 40
    };

    const response = await api.put('/treasury', newAllocation);
    
    if (response.data.reservePercentage === 40) {
      logSuccess(`Treasury allocation updated: ${response.data.reservePercentage}% reserve, ${response.data.operationsPercentage}% operations`);
      return true;
    }
    throw new Error('Treasury allocation update failed');
  } catch (error) {
    logError(`Treasury allocation failed: ${error.message}`);
    return false;
  }
}

async function testBlockchainService() {
  logStep('Testing blockchain service...');
  try {
    // Test address validation
    const { isValidAddress } = require('./server/src/services/blockchainService');
    
    if (isValidAddress(testWallet.address)) {
      logSuccess('Wallet address validation works');
      
      // Test amount formatting
      const { formatAmount, parseAmount } = require('./server/src/services/blockchainService');
      const formatted = formatAmount('1000000', 6); // 1 USDC in smallest units
      const parsed = parseAmount('1', 6);
      
      logSuccess(`Amount formatting: ${formatted} USDC`);
      logSuccess(`Amount parsing: ${parsed} smallest units`);
      
      return true;
    }
    throw new Error('Address validation failed');
  } catch (error) {
    logError(`Blockchain service test failed: ${error.message}`);
    return false;
  }
}

async function testMobileMoneyIntegration() {
  logStep('Testing mobile money integration...');
  try {
    const { getMobileMoneyBalances } = require('./server/src/services/agentService');
    const balances = await getMobileMoneyBalances(userId);
    
    if (balances.mpesa && balances.airtel) {
      logSuccess(`M-Pesa balance: ${balances.mpesa.balance} ${balances.mpesa.currency}`);
      logSuccess(`Airtel balance: ${balances.airtel.balance} ${balances.airtel.currency}`);
      return true;
    }
    throw new Error('Mobile money balances not available');
  } catch (error) {
    logError(`Mobile money integration failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Float End-to-End Tests');
  console.log('=====================================\n');

  const results = {
    healthCheck: false,
    walletConnection: false,
    treasuryCreation: false,
    agentRecommendations: false,
    paymentExecution: false,
    paymentHistory: false,
    x402Payment: false,
    treasuryAllocation: false,
    blockchainService: false,
    mobileMoneyIntegration: false
  };

  // Run tests sequentially
  results.healthCheck = await testHealthCheck();
  await delay(1000);

  if (results.healthCheck) {
    results.walletConnection = await testWalletConnection();
    await delay(1000);

    if (results.walletConnection) {
      results.treasuryCreation = await testTreasuryCreation();
      await delay(1000);

      results.blockchainService = await testBlockchainService();
      await delay(1000);

      results.mobileMoneyIntegration = await testMobileMoneyIntegration();
      await delay(1000);

      const agentResult = await testAgentRecommendations();
      if (agentResult) {
        results.agentRecommendations = true;
        await delay(1000);

        results.paymentExecution = await testPaymentExecution(agentResult.topRecommendation);
        await delay(1000);
      }

      results.paymentHistory = await testPaymentHistory();
      await delay(1000);

      results.x402Payment = await testX402Payment();
      await delay(1000);

      results.treasuryAllocation = await testTreasuryAllocation();
      await delay(1000);
    }
  }

  // Results summary
  console.log('\n=====================================');
  console.log('📊 Test Results Summary');
  console.log('=====================================');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });

  console.log(`\n📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);

  if (passed === total) {
    console.log('🎉 All tests passed! Float is ready for JengaHacks 2026 demo!');
    console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    console.log(`🔧 Backend: ${API_BASE}`);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }

  process.exit(passed === total ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests };
