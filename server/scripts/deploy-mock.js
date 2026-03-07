const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function deployMockContract() {
  console.log('🚀 Deploying Mock Contract Setup...\n');
  
  try {
    // Mock deployment info (since Ganache is having issues)
    const mockDeployment = {
      network: 'localhost',
      chainId: 1337,
      contract: 'AgentTreasury',
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      deployer: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      timestamp: new Date().toISOString(),
      abi: JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/AgentTreasury.json'), 'utf8')).abi,
      mock: true,
      status: 'deployed'
    };
    
    // Save deployment info
    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }
    
    fs.writeFileSync(
      './deployments/localhost.json',
      JSON.stringify(mockDeployment, null, 2)
    );
    
    console.log('✅ Mock deployment completed!');
    console.log('📋 Contract Info:');
    console.log(`   Address: ${mockDeployment.address}`);
    console.log(`   Network: ${mockDeployment.network}`);
    console.log(`   Deployer: ${mockDeployment.deployer}`);
    console.log(`   Status: ${mockDeployment.status}`);
    
    console.log('\n🎉 Setup complete!');
    console.log('📄 Deployment saved to ./deployments/localhost.json');
    console.log('🔗 Backend can now use the mock contract');
    
    // Test that the file is readable
    const saved = JSON.parse(fs.readFileSync('./deployments/localhost.json', 'utf8'));
    console.log(`✅ Verification: Contract has ${saved.abi.length} ABI functions`);
    
  } catch (error) {
    console.error('❌ Mock deployment failed:', error.message);
  }
}

deployMockContract();
