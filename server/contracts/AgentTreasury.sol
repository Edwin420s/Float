// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentTreasury is Ownable {
    mapping(address => bool) public authorisedAgents;

    event PaymentExecuted(address indexed to, uint256 amount, address token);
    event AgentAuthorised(address agent);
    event AgentRevoked(address agent);

    constructor(address _owner) Ownable(_owner) {}

    modifier onlyAgent() {
        require(authorisedAgents[msg.sender] || msg.sender == owner(), "Not authorised");
        _;
    }

    function authoriseAgent(address _agent) external onlyOwner {
        authorisedAgents[_agent] = true;
        emit AgentAuthorised(_agent);
    }

    function revokeAgent(address _agent) external onlyOwner {
        authorisedAgents[_agent] = false;
        emit AgentRevoked(_agent);
    }

    // Execute payment in native currency or ERC20
    function executePayment(address to, uint256 amount, address token) external onlyAgent {
        if (token == address(0)) {
            // native currency (e.g., ETH on Base)
            payable(to).transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
        emit PaymentExecuted(to, amount, token);
    }

    // Allow contract to receive native currency
    receive() external payable {}
}