const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Compile contracts and generate ABI
console.log('Compiling smart contracts...');

try {
  // Change to contracts directory
  process.chdir(path.join(__dirname, '../contracts'));
  
  // Run Hardhat compile
  execSync('npx hardhat compile', { stdio: 'inherit' });
  
  // Copy ABI to services directory for easy import
  const contractDir = path.join(__dirname, '../artifacts/contracts');
  const targetDir = path.join(__dirname, '../contracts');
  
  if (fs.existsSync(path.join(contractDir, 'AgentTreasury.sol', 'AgentTreasury.json'))) {
    fs.copyFileSync(
      path.join(contractDir, 'AgentTreasury.sol', 'AgentTreasury.json'),
      path.join(targetDir, 'AgentTreasury.json')
    );
    console.log('✅ AgentTreasury ABI copied to contracts directory');
  }
  
  console.log('✅ Smart contracts compiled successfully');
} catch (error) {
  console.error('❌ Contract compilation failed:', error);
  process.exit(1);
}
