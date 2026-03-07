// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentTreasury is Ownable, ReentrancyGuard {
    // State variables
    address public authorizedAgent;
    mapping(address => uint256) public tokenBalances;
    
    // Payment tracking
    struct PaymentRecord {
        string invoiceId;
        address supplier;
        uint256 amount;
        address token;
        uint256 timestamp;
        bool executed;
    }
    
    mapping(string => PaymentRecord) public payments;
    string[] public paymentIds;
    
    // Savings tracking
    uint256 public totalSavingsGenerated;
    mapping(string => uint256) public invoiceSavings;
    
    // Events
    event PaymentExecuted(
        address indexed supplier,
        uint256 amount,
        address indexed token,
        string invoiceId,
        uint256 timestamp,
        uint256 savings
    );
    
    event FundsDeposited(
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    
    event AgentAuthorized(address indexed agent);
    event AgentRevoked(address indexed agent);
    
    // Modifiers
    modifier onlyAuthorizedAgent() {
        require(
            msg.sender == authorizedAgent || msg.sender == owner(),
            "AgentTreasury: Not authorized"
        );
        _;
    }
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), "AgentTreasury: Invalid address");
        _;
    }
    
    constructor(address _owner, address _agent) Ownable(_owner) {
        authorizedAgent = _agent;
        emit AgentAuthorized(_agent);
    }
    
    // Owner functions
    
    /**
     * @dev Authorize an agent to execute treasury operations
     * @param _agent Address of the agent to authorize
     */
    function authorizeAgent(address _agent) external onlyOwner validAddress(_agent) {
        authorizedAgent = _agent;
        emit AgentAuthorized(_agent);
    }
    
    /**
     * @dev Revoke current agent authorization
     */
    function revokeAgent() external onlyOwner {
        address currentAgent = authorizedAgent;
        authorizedAgent = address(0);
        emit AgentRevoked(currentAgent);
    }
    
    /**
     * @dev Emergency withdrawal of funds (only owner)
     * @param _token Token address (0 for native)
     * @param _amount Amount to withdraw
     * @param _to Recipient address
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount,
        address _to
    ) external onlyOwner validAddress(_to) nonReentrant {
        if (_token == address(0)) {
            require(address(this).balance >= _amount, "AgentTreasury: Insufficient native balance");
            payable(_to).transfer(_amount);
        } else {
            require(
                IERC20(_token).balanceOf(address(this)) >= _amount,
                "AgentTreasury: Insufficient token balance"
            );
            IERC20(_token).transfer(_to, _amount);
        }
    }
    
    // Agent functions
    
    /**
     * @dev Execute payment to supplier with invoice tracking
     * @param _supplier Supplier wallet address
     * @param _amount Payment amount
     * @param _token Token address (0 for native currency)
     * @param _invoiceId Invoice identifier
     * @param _savings Amount saved (e.g., from early payment discount)
     */
    function paySupplier(
        address _supplier,
        uint256 _amount,
        address _token,
        string calldata _invoiceId,
        uint256 _savings
    ) external onlyAuthorizedAgent validAddress(_supplier) nonReentrant {
        require(_amount > 0, "AgentTreasury: Amount must be greater than 0");
        require(bytes(_invoiceId).length > 0, "AgentTreasury: Invoice ID required");
        
        // Check if payment already exists
        require(
            !payments[_invoiceId].executed,
            "AgentTreasury: Payment already executed"
        );
        
        // Execute payment
        if (_token == address(0)) {
            // Native currency payment (ETH on Base)
            require(
                address(this).balance >= _amount,
                "AgentTreasury: Insufficient native balance"
            );
            payable(_supplier).transfer(_amount);
        } else {
            // ERC20 token payment (USDC on Base)
            require(
                IERC20(_token).balanceOf(address(this)) >= _amount,
                "AgentTreasury: Insufficient token balance"
            );
            IERC20(_token).transfer(_supplier, _amount);
        }
        
        // Record payment
        PaymentRecord memory record = PaymentRecord({
            invoiceId: _invoiceId,
            supplier: _supplier,
            amount: _amount,
            token: _token,
            timestamp: block.timestamp,
            executed: true
        });
        
        payments[_invoiceId] = record;
        paymentIds.push(_invoiceId);
        
        // Track savings
        if (_savings > 0) {
            totalSavingsGenerated += _savings;
            invoiceSavings[_invoiceId] = _savings;
        }
        
        // Update token balance tracking
        tokenBalances[_token] += _amount;
        
        emit PaymentExecuted(
            _supplier,
            _amount,
            _token,
            _invoiceId,
            block.timestamp,
            _savings
        );
    }
    
    // View functions
    
    /**
     * @dev Get payment details by invoice ID
     * @param _invoiceId Invoice identifier
     * @return Payment record
     */
    function getPayment(string calldata _invoiceId) 
        external 
        view 
        returns (PaymentRecord memory) 
    {
        return payments[_invoiceId];
    }
    
    /**
     * @dev Get all payment IDs
     * @return Array of payment IDs
     */
    function getPaymentIds() external view returns (string[] memory) {
        return paymentIds;
    }
    
    /**
     * @dev Get total number of payments
     * @return Payment count
     */
    function getPaymentCount() external view returns (uint256) {
        return paymentIds.length;
    }
    
    /**
     * @dev Get savings for specific invoice
     * @param _invoiceId Invoice identifier
     * @return Savings amount
     */
    function getInvoiceSavings(string calldata _invoiceId) 
        external 
        view 
        returns (uint256) 
    {
        return invoiceSavings[_invoiceId];
    }
    
    /**
     * @dev Get contract balance for specific token
     * @param _token Token address (0 for native)
     * @return Token balance
     */
    function getTokenBalance(address _token) external view returns (uint256) {
        if (_token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(_token).balanceOf(address(this));
        }
    }
    
    /**
     * @dev Get treasury summary
     * @return totalBalance Total balance in native currency
     * @return totalSavings Total savings generated
     * @return paymentCount Total number of payments
     * @return currentAgent Current authorized agent
     */
    function getTreasurySummary() 
        external 
        view 
        returns (
            uint256 totalBalance,
            uint256 totalSavings,
            uint256 paymentCount,
            address currentAgent
        ) 
    {
        return (
            address(this).balance,
            totalSavingsGenerated,
            paymentIds.length,
            authorizedAgent
        );
    }
    
    // Receive function for native currency deposits
    receive() external payable {
        if (msg.value > 0) {
            tokenBalances[address(0)] += msg.value;
            emit FundsDeposited(address(0), msg.value, block.timestamp);
        }
    }
    
    // Fallback function
    fallback() external payable {
        if (msg.value > 0) {
            tokenBalances[address(0)] += msg.value;
            emit FundsDeposited(address(0), msg.value, block.timestamp);
        }
    }
}