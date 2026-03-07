const { ethers } = require('ethers');
const path = require('path');
const AgentTreasuryABI = require(path.join(__dirname, '../../contracts/AgentTreasury.json'));
const logger = require('../utils/logger');

class TreasuryContractService {
    constructor() {
        this.contracts = new Map(); // treasuryAddress -> contract instance
        this.provider = null;
        this.signer = null;
    }

    /**
     * Initialize the service with provider and signer
     */
    async initialize() {
        try {
            const rpcUrl = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            const privateKey = process.env.PRIVATE_KEY;
            if (privateKey && privateKey !== 'your_private_key_here') {
                this.signer = new ethers.Wallet(privateKey, this.provider);
                logger.info('Treasury contract service initialized with signer');
            } else {
                logger.warn('Treasury contract service initialized in demo mode (no signer)');
            }

            return true;
        } catch (error) {
            logger.error('Failed to initialize treasury contract service:', error);
            throw error;
        }
    }

    /**
     * Deploy new AgentTreasury contract for user
     * @param {string} userId User identifier
     * @param {address} agentAddress Authorized agent address
     * @returns {Promise<string>} Treasury contract address
     */
    async deployTreasury(userId, agentAddress) {
        try {
            if (!this.signer) {
                // Return mock address for demo
                const mockAddress = this.generateMockAddress(userId);
                logger.info(`Mock treasury deployed for user ${userId} at ${mockAddress}`);
                return mockAddress;
            }

            // Deploy contract
            const contractFactory = new ethers.ContractFactory(
                AgentTreasuryABI.abi,
                AgentTreasuryABI.bytecode,
                this.signer
            );

            const contract = await contractFactory.deploy(
                await this.signer.getAddress(), // owner
                agentAddress // authorized agent
            );

            await contract.waitForDeployment();
            const contractAddress = await contract.getAddress();

            logger.info(`Treasury deployed for user ${userId} at ${contractAddress}`);
            
            // Cache contract instance
            this.contracts.set(contractAddress, contract);

            return contractAddress;
        } catch (error) {
            logger.error(`Failed to deploy treasury for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get contract instance for treasury
     * @param {string} treasuryAddress Treasury contract address
     * @returns {ethers.Contract} Contract instance
     */
    getContract(treasuryAddress) {
        if (this.contracts.has(treasuryAddress)) {
            return this.contracts.get(treasuryAddress);
        }

        const contract = new ethers.Contract(
            treasuryAddress,
            AgentTreasuryABI.abi,
            this.signer || this.provider
        );

        this.contracts.set(treasuryAddress, contract);
        return contract;
    }

    /**
     * Execute payment to supplier
     * @param {string} treasuryAddress Treasury contract address
     * @param {address} supplier Supplier wallet address
     * @param {number} amount Payment amount
     * @param {address} tokenAddress Token address (0 for native)
     * @param {string} invoiceId Invoice identifier
     * @param {number} savings Amount saved
     * @returns {Promise<string>} Transaction hash
     */
    async executePayment(treasuryAddress, supplier, amount, tokenAddress, invoiceId, savings = 0) {
        try {
            const contract = this.getContract(treasuryAddress);
            
            if (!this.signer) {
                // Mock transaction for demo
                const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2)}`;
                logger.info(`Mock payment executed: ${mockTxHash}`);
                return mockTxHash;
            }

            // Convert amount to wei/USDC units
            const amountWei = tokenAddress === '0x0000000000000000000000000000000000000000000' 
                ? ethers.parseEther(amount.toString())
                : ethers.parseUnits(amount.toString(), 6); // USDC uses 6 decimals

            // Execute payment
            const tx = await contract.paySupplier(
                supplier,
                amountWei,
                tokenAddress,
                invoiceId,
                ethers.parseUnits(savings.toString(), 6) // Savings in USDC units
            );

            const receipt = await tx.wait();
            
            logger.info(`Payment executed: ${receipt.hash}`, {
                supplier,
                amount,
                invoiceId,
                savings
            });

            return receipt.hash;
        } catch (error) {
            logger.error('Payment execution failed:', error);
            throw error;
        }
    }

    /**
     * Get treasury balance
     * @param {string} treasuryAddress Treasury contract address
     * @param {address} tokenAddress Token address (0 for native)
     * @returns {Promise<number>} Balance
     */
    async getBalance(treasuryAddress, tokenAddress = '0x0000000000000000000000000000000000000000000') {
        try {
            const contract = this.getContract(treasuryAddress);
            const balance = await contract.getTokenBalance(tokenAddress);
            
            if (tokenAddress === '0x0000000000000000000000000000000000000000000') {
                return parseFloat(ethers.formatEther(balance));
            } else {
                return parseFloat(ethers.formatUnits(balance, 6)); // USDC uses 6 decimals
            }
        } catch (error) {
            logger.error('Failed to get treasury balance:', error);
            return 0;
        }
    }

    /**
     * Get payment details
     * @param {string} treasuryAddress Treasury contract address
     * @param {string} invoiceId Invoice identifier
     * @returns {Promise<Object>} Payment details
     */
    async getPayment(treasuryAddress, invoiceId) {
        try {
            const contract = this.getContract(treasuryAddress);
            const payment = await contract.getPayment(invoiceId);
            
            return {
                invoiceId: payment.invoiceId,
                supplier: payment.supplier,
                amount: payment.amount.toString(),
                token: payment.token,
                timestamp: new Date(payment.timestamp.toNumber() * 1000),
                executed: payment.executed
            };
        } catch (error) {
            logger.error('Failed to get payment details:', error);
            return null;
        }
    }

    /**
     * Get all payment IDs
     * @param {string} treasuryAddress Treasury contract address
     * @returns {Promise<string[]>} Array of payment IDs
     */
    async getPaymentIds(treasuryAddress) {
        try {
            const contract = this.getContract(treasuryAddress);
            return await contract.getPaymentIds();
        } catch (error) {
            logger.error('Failed to get payment IDs:', error);
            return [];
        }
    }

    /**
     * Get treasury summary
     * @param {string} treasuryAddress Treasury contract address
     * @returns {Promise<Object>} Treasury summary
     */
    async getTreasurySummary(treasuryAddress) {
        try {
            const contract = this.getContract(treasuryAddress);
            const summary = await contract.getTreasurySummary();
            
            return {
                totalBalance: parseFloat(ethers.formatEther(summary.totalBalance)),
                totalSavings: parseFloat(ethers.formatUnits(summary.totalSavings, 6)),
                paymentCount: summary.paymentCount.toString(),
                currentAgent: summary.currentAgent
            };
        } catch (error) {
            logger.error('Failed to get treasury summary:', error);
            return {
                totalBalance: 0,
                totalSavings: 0,
                paymentCount: '0',
                currentAgent: null
            };
        }
    }

    /**
     * Authorize agent for treasury
     * @param {string} treasuryAddress Treasury contract address
     * @param {address} agentAddress Agent address to authorize
     * @returns {Promise<string>} Transaction hash
     */
    async authorizeAgent(treasuryAddress, agentAddress) {
        try {
            const contract = this.getContract(treasuryAddress);
            
            if (!this.signer) {
                logger.info(`Mock agent authorization for ${agentAddress}`);
                return `mock_auth_${Date.now()}`;
            }

            const tx = await contract.authorizeAgent(agentAddress);
            const receipt = await tx.wait();
            
            logger.info(`Agent authorized: ${receipt.hash}`, { agentAddress });
            return receipt.hash;
        } catch (error) {
            logger.error('Failed to authorize agent:', error);
            throw error;
        }
    }

    /**
     * Get transaction details
     * @param {string} txHash Transaction hash
     * @returns {Promise<Object>} Transaction details
     */
    async getTransaction(txHash) {
        try {
            const tx = await this.provider.getTransaction(txHash);
            const receipt = await this.provider.getTransactionReceipt(txHash);
            
            return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value.toString(),
                gasUsed: receipt.gasUsed.toString(),
                status: receipt.status === 1 ? 'success' : 'failed',
                blockNumber: receipt.blockNumber,
                timestamp: new Date()
            };
        } catch (error) {
            logger.error('Failed to get transaction details:', error);
            return null;
        }
    }

    /**
     * Generate mock address for demo purposes
     * @param {string} userId User identifier
     * @returns {string} Mock address
     */
    generateMockAddress(userId) {
        const hash = require('crypto')
            .createHash('sha256')
            .update(userId + 'treasury')
            .digest('hex');
        
        return '0x' + hash.substring(0, 40);
    }

    /**
     * Validate address format
     * @param {string} address Address to validate
     * @returns {boolean} True if valid
     */
    isValidAddress(address) {
        return ethers.isAddress(address);
    }

    /**
     * Format amount for display
     * @param {number|string} amount Amount to format
     * @param {number} decimals Number of decimals
     * @returns {string} Formatted amount
     */
    formatAmount(amount, decimals = 6) {
        return ethers.formatUnits(amount.toString(), decimals);
    }

    /**
     * Parse amount for transactions
     * @param {number|string} amount Amount to parse
     * @param {number} decimals Number of decimals
     * @returns {bigint} Parsed amount
     */
    parseAmount(amount, decimals = 6) {
        return ethers.parseUnits(amount.toString(), decimals);
    }
}

module.exports = new TreasuryContractService();
