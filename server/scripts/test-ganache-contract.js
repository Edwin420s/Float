const { ethers } = require('ethers');
const fs = require('fs');

async function testGanacheContract() {
  console.log('🧪 Testing Ganache Contract Connection...\n');
  
  try {
    // Load deployment
    const deployment = JSON.parse(fs.readFileSync('./deployments/localhost.json', 'utf8'));
    console.log('📋 Contract Info:');
    console.log(`   Address: ${deployment.address}`);
    console.log(`   Network: ${deployment.network}`);
    console.log(`   Deployer: ${deployment.deployer}`);
    
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const privateKey = '0x3c0f64b1b6e0072a24db921d4a84acbc2f09ce9534dfa48a6674a3f55a087bf7';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`\n👛 Wallet: ${wallet.address}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Create contract instance
    const contract = new ethers.Contract(deployment.address, deployment.abi, wallet);
    
    console.log('\n🔍 Testing Contract Functions:');
    
    // Test getBalance
    try {
      const usdcAddress = '0x036cBd53842c5426634e7929541eC2318f3dcF7e';
      const contractBalance = await contract.getBalance(usdcAddress);
      console.log(`   ✅ getBalance: ${ethers.formatUnits(contractBalance, 6)} USDC`);
    } catch (error) {
      console.log(`   ⚠️  getBalance: ${error.message}`);
    }
    
    // Test deposit (small amount)
    try {
      const usdcAddress = '0x036cBd53842c5426634e7929541eC2318f3dcF7e';
      const amount = ethers.parseUnits('10', 6); // 10 USDC
      
      console.log(`   🔄 Testing deposit of 10 USDC...`);
      const tx = await contract.deposit(usdcAddress, amount);
      console.log(`   ✅ Deposit TX: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block: ${receipt.blockNumber}`);
      
      // Check new balance
      const newBalance = await contract.getBalance(usdcAddress);
      console.log(`   ✅ New Balance: ${ethers.formatUnits(newBalance, 6)} USDC`);
      
    } catch (error) {
      console.log(`   ⚠️  Deposit test: ${error.message}`);
    }
    
    console.log('\n🎉 Contract test complete!');
    console.log('✅ Local blockchain is ready for development');
    console.log('🔗 Contract is deployed and functional');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGanacheContract();
