# Run Float Locally on Fedora 43

## 🚀 Quick Start - 3 Separate Terminals

### Terminal 1: Start Ganache Blockchain
```bash
cd /home/skywalker/Projects/prj/Float/server
npx ganache --host 0.0.0.0 --port 8545 --deterministic
```

### Terminal 2: Start Backend Server  
```bash
cd /home/skywalker/Projects/prj/Float/server
npm start
```

### Terminal 3: Deploy Contract (after Ganache is running)
```bash
cd /home/skywalker/Projects/prj/Float/server
node scripts/deploy-to-ganache.js
```

## 📋 What You'll See:

### Ganache Terminal 1:
- 10 test accounts with 1000 ETH each
- RPC listening on 0.0.0.0:8545
- Chain ID: 1337

### Backend Terminal 2:
- Database connected successfully
- Treasury contract service initialized
- Server running on port 5000
- Some Redis errors (can be ignored for basic functionality)

### Contract Terminal 3:
- Contract deployment to Ganache
- Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- ABI saved for backend integration

## 🔗 Access Points:
- **Backend API**: http://localhost:5000
- **Blockchain RPC**: http://localhost:8545
- **Contract**: Deployed automatically

## 🛠 Fedora 43 Specific Notes:
- Use separate terminal windows/tabs
- Keep Ganache running in Terminal 1
- Backend will work even with Redis connection errors
- Contract deployment requires Ganache to be running first

## ✅ Success Indicators:
1. Ganache shows "RPC Listening on 0.0.0.0:8545"
2. Backend shows "Server running on port 5000"
3. Contract deployment shows "✅ AgentTreasury deployed"

## 🎯 Ready for Development:
Once all 3 terminals are running, you have:
- Local blockchain with test accounts
- Backend server with database
- Smart contract deployed and ready
- Full local development environment
