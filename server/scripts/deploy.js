const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy AgentTreasury (factory)
  const AgentTreasury = await hre.ethers.getContractFactory("AgentTreasury");
  const treasury = await AgentTreasury.deploy(deployer.address);
  await treasury.waitForDeployment();
  console.log("AgentTreasury deployed to:", await treasury.getAddress());

  // Deploy TreasuryAllocation
  const TreasuryAllocation = await hre.ethers.getContractFactory("TreasuryAllocation");
  const allocation = await TreasuryAllocation.deploy(deployer.address);
  await allocation.waitForDeployment();
  console.log("TreasuryAllocation deployed to:", await allocation.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});