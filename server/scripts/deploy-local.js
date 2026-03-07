const hre = require("hardhat");

async function main() {
  console.log("Starting local deployment...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  try {
    // Deploy AgentTreasury
    const AgentTreasury = await hre.ethers.getContractFactory("AgentTreasury");
    const treasury = await AgentTreasury.deploy(deployer.address);
    await treasury.waitForDeployment();
    
    const treasuryAddress = await treasury.getAddress();
    console.log("✅ AgentTreasury deployed to:", treasuryAddress);
    
    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      network: "localhost",
      AgentTreasury: {
        address: treasuryAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(
      './deployments/localhost.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("✅ Deployment info saved to ./deployments/localhost.json");
    
    // Verify contract is working
    const owner = await treasury.owner();
    console.log("✅ Contract owner:", owner);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
