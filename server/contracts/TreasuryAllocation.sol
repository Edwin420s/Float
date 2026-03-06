// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TreasuryAllocation is Ownable {
    struct Rule {
        string condition; // e.g., "balance > 50000"
        string action;    // e.g., "move 20% to reserve"
        bool active;
    }
 
    Rule[] public rules;

    event RuleAdded(uint256 index, string condition, string action);
    event RuleUpdated(uint256 index, bool active);

    constructor(address _owner) Ownable(_owner) {}

    function addRule(string memory condition, string memory action) external onlyOwner {
        rules.push(Rule(condition, action, true));
        emit RuleAdded(rules.length - 1, condition, action);
    }

    function toggleRule(uint256 index) external onlyOwner {
        require(index < rules.length, "Rule does not exist");
        rules[index].active = !rules[index].active;
        emit RuleUpdated(index, rules[index].active);
    }

    function getRules() external view returns (Rule[] memory) {
        return rules;
    }
}