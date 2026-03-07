# Float by Quiet Capital

> Autonomous SME Treasury Agent for JengaHacks 2026

## 🎯 Project Overview

Float is an autonomous treasury agent that helps Small and Medium Enterprises (SMEs) operating across fragmented mobile money and banking systems optimize their liquidity through intelligent, automated financial decisions. Built for the JengaHacks 2026 competition, Float demonstrates the power of AI agents operating on the Base network with x402 payment protocols.

## 🌍 The Problem

In East Africa, SMEs face critical financial challenges:

- **Fragmented Liquidity**: Operating across M-Pesa, Airtel Money, MTN Mobile Money, and traditional banking
- **Manual Decision Making**: Financial decisions are reactive rather than strategic
- **Working Capital Stress**: Unnecessary borrowing, missed supplier discounts, and idle capital
- **Trust Costs**: High friction in cross-platform transactions and delayed settlements

## 🤖 Our Solution

Float is an **autonomous treasury operator** that:
- Continuously monitors liquidity state across multiple payment rails
- Evaluates financial decisions using economic intelligence
- Executes optimized actions automatically on Base network
- Demonstrates true agent autonomy with onchain treasury management

## 👥 Target Users

### Primary Users: Small Business Owners
- Retail shop owners, wholesalers, small manufacturers
- E-commerce sellers, service providers
- Businesses managing $5K - $100K monthly revenue
- Users of M-Pesa, Airtel Money, MTN Mobile Money

### Secondary Users
- Finance managers in larger SMEs
- Suppliers seeking faster payments
- Accountants needing transparent records

## 🏗️ Technical Architecture

### Frontend Layer
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS with professional dark theme
- **State Management**: React Context + Hooks
- **Charts**: Recharts for cash flow visualization
- **Wallet Integration**: Coinbase Smart Wallet SDK

### Backend/Server API
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL for users, treasuries, transactions
- **Queue System**: Redis + Bull for async payment processing
- **Authentication**: JWT + OAuth for wallet connections

### Blockchain Layer
- **Network**: Base (Ethereum L2)
- **Smart Contracts**: AgentTreasury.sol, TreasuryAllocation.sol
- **Payment Protocol**: x402 HTTP-native payments
- **Wallet Infrastructure**: Coinbase Smart Wallets

### Mobile Money Bridge
- **Supported Platforms**: M-Pesa, Airtel Money, MTN Mobile Money
- **Integration**: Simulated API bridge for hackathon demo
- **Future**: Real telco API integrations

## 📱 User Interface

### Landing Page
Professional introduction with:
- Hero section showcasing value proposition
- Feature highlights: Monitor Balances, Optimize Cashflow, Automate Payments
- Connect Wallet call-to-action
- Footer with Quiet Capital branding

### Dashboard
Main workspace featuring:
- **Balance Overview**: Total liquidity display with USDC formatting
- **Cash Flow Chart**: 7-day transaction history with specific entries
- **Agent Recommendations**: Actionable insights with "ACT NOW" buttons
- **Mobile Money Breakdown**: M-Pesa and Airtel balances in KES

### Treasury Management
Control center for:
- **Treasury Allocation**: Interactive sliders for Reserve (50%) and Operations (30%)
- **Smart Rules**: Conditional logic (e.g., "IF Balance > 50,000 THEN Move to Reserve")
- **Preview & Execute**: Test and deploy allocation strategies

### Transactions
Payment operations hub:
- **New Payment Form**: Pre-filled with supplier details and amounts
- **Payment History**: Card-based layout with approval buttons
- **Pending Actions**: "Approve Payment Fee" functionality

### Demo Flow Guide
Step-by-step demonstration:
1. Connect Wallet
2. View Recommendation: Save 9% on Invoice
3. Execute Payment on Base
4. Track Results: Payment Confirmed!

## 🎨 Design System

### Color Palette
- **Primary**: Deep Navy (#0F1C3F) - Main backgrounds
- **Accent**: Light Blue (#4FC3F7) - Buttons, highlights
- **Surface**: Dark Blue (#1C2747) - Cards, panels
- **Success**: Green (#34D399) - Positive actions
- **Warning**: Yellow (#FBBF24) - Alerts
- **Error**: Red (#EF4444) - Errors
- **Text**: White (#FFFFFF) primary, Gray (#CBD5E1) secondary

### Typography & Layout
- Dark theme optimized for professional presentation
- Card-based layouts with consistent spacing
- Responsive design for mobile and desktop
- Clean navigation with Header-only layout (no sidebar duplication)

## 🚀 Key Features

### ✅ Autonomous Treasury Operations
- Continuous monitoring of liquidity across mobile money platforms
- Intelligent payment timing optimization
- Automated execution of financial decisions
- Real-time decision reasoning and audit trails

### ✅ Blockchain-Powered Security
- Base network integration for transparent transactions
- Smart contract enforced treasury rules
- USDC stablecoin payments with verification
- x402 protocol for machine-to-machine transactions

### ✅ Mobile Money Integration
- Multi-platform support (M-Pesa, Airtel, MTN)
- Cross-wallet liquidity aggregation
- KES and USDC balance tracking
- Simulated telco API integration

### ✅ Professional User Experience
- Dark-themed professional interface
- Real-time dashboard with actionable insights
- Mobile-responsive design
- Step-by-step demo guidance

## 🤖 Agent Working System

### Decision Engine Workflow
The Float agent operates in a continuous 4-stage cycle:

#### 1. Observation Phase
- Monitors wallet balances across platforms
- Tracks incoming supplier invoices
- Analyzes payment deadlines and discount terms
- Maintains real-time liquidity state

#### 2. Opportunity Detection
- Scans for early payment discounts
- Identifies optimization opportunities
- Evaluates cross-platform arbitrage possibilities
- Detects liquidity inefficiencies

#### 3. Decision Evaluation
- Performs safety checks (minimum reserves)
- Calculates cost-benefit analysis
- Assesses risk factors
- Determines optimal action timing

#### 4. Autonomous Execution
- Executes payments via smart contracts
- Records transactions on Base blockchain
- Updates dashboard with results
- Logs decision reasoning

### Example Agent Scenario
```
Invoice: $2,000 from Supplier X
Due: 10 days
Early Payment Discount: 9%
Available Liquidity: $8,000
Minimum Reserve: $4,000

Agent Analysis:
- Potential Savings: $180
- Liquidity After Payment: $6,000 (above minimum)
- Decision: PAY EARLY
- Action: Execute via Base network
```

## 📊 Technical Implementation

### Smart Contracts
```solidity
// AgentTreasury.sol
contract AgentTreasury {
    function executePayment(address recipient, uint256 amount) external;
    function allocateLiquidity(uint256 reservePercent, uint256 operationsPercent) external;
    function getBalance() external view returns (uint256);
}

// TreasuryAllocation.sol
contract TreasuryAllocation {
    function setRule(string memory condition, string memory action) external;
    function evaluateRule(bytes memory data) external returns (bool);
}
```

### Agent Decision Logic
```javascript
// Example decision engine
const evaluatePayment = (liquidity, invoice, borrowingRate) => {
    const earlyDiscount = 0.09; // 9% early payment discount
    const borrowingCost = borrowingRate * (invoice.dueDays / 365);
    
    if (earlyDiscount > borrowingCost && liquidity.surplus >= invoice.amount) {
        return {
            action: 'PAY_EARLY',
            reasoning: `Save ${earlyDiscount * 100}% vs ${borrowingCost * 100}% borrowing cost`,
            savings: (earlyDiscount - borrowingCost) * invoice.amount
        };
    }
    
    return { action: 'WAIT', reasoning: 'Borrowing cheaper than early payment' };
};
```

## 🔗 Blockchain Integration

### Base Network Role
Base serves as the secure settlement layer:
- **Treasury Storage**: Funds held in smart contracts
- **Payment Execution**: Transparent, verifiable transactions
- **Record Keeping**: Immutable payment history
- **Trust Layer**: No single point of failure

### x402 Payment Protocol
Enables machine-to-machine payments:
- Agent pays Risk Oracle for data analysis
- Service-to-service transactions
- HTTP-native payment headers
- Autonomous economic interactions

### Transaction Flow
1. Agent detects opportunity
2. Backend prepares transaction
3. Smart contract validates rules
4. Base network executes payment
5. Dashboard updates with confirmation

## 🛠️ Development Stack

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "tailwindcss": "^3.2.0",
  "recharts": "^2.5.0",
  "ethers": "^5.7.0",
  "@coinbase/wallet-sdk": "^3.7.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "pg": "^8.9.0",
  "redis": "^4.6.0",
  "bull": "^4.10.0",
  "ethers": "^5.7.0",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.0"
}
```

## 📁 Project Structure

```
Float/
├── Client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components (22 files)
│   │   ├── pages/         # Main pages (5 files)
│   │   ├── context/       # React contexts
│   │   └── hooks/         # Custom hooks
│   └── package.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # API handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   ├── routes/        # Express routes
│   │   └── contracts/     # Smart contracts
│   ├── migrations/        # DB migrations
│   └── package.json
├── test_end_to_end.js     # Comprehensive testing suite
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Base network wallet (testnet)

### Installation
```bash
# Clone repository
git clone https://github.com/Edwin420s/float.git
cd float

# Install frontend dependencies
cd Client
npm install

# Install backend dependencies
cd ../server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your keys

# Setup database
npm run migrate

# Start development servers
npm run dev  # Backend (port 3001)
cd ../Client
npm run dev  # Frontend (port 5173)
```

### Demo Mode
1. Connect wallet on Base testnet
2. Navigate to Dashboard
3. Click "Demo Flow" button
4. Follow step-by-step guide
5. Watch agent execute autonomous payment

## 🎯 Demo Script (3 Minutes)

1. **Problem Introduction** (30s)
   - "SMEs in East Africa operate across M-Pesa, Airtel, MTN"
   - "Money moves instantly, but financial intelligence doesn't"

2. **Float Solution** (60s)
   - Show dashboard with fragmented balances
   - Display upcoming supplier invoice
   - Agent recommends early payment to save 9%

3. **Live Execution** (60s)
   - Agent executes payment on Base network
   - Show transaction hash and confirmation
   - Display savings and optimization results

4. **Machine Economy** (30s)
   - Agent pays Risk Oracle via x402 for future analysis
   - Demonstrates autonomous economic interaction

## 📊 Testing & Quality Assurance

### End-to-End Testing
- Comprehensive test suite (361 lines)
- API coverage for all endpoints
- Blockchain transaction verification
- UI component interaction testing

### Quality Features
- Error handling and logging
- Security best practices
- Performance optimization
- Mobile responsiveness

## 🔮 Future Roadmap

### Post-Hackathon Development
- Real mobile money API integration (M-Pesa, Airtel, MTN)
- Advanced AI optimization models
- Multi-currency support
- Regulatory compliance framework
- SME pilot programs in Kenya, Uganda, Tanzania

### Long-term Vision
- Become treasury operating system for African SMEs
- Expand to cross-border payments and FX optimization
- Build agent economy marketplace
- Integrate with traditional banking systems

## 👥 Team: Quiet Capital

**Edwin Mwiti** - Technical Lead & System Architect  
*Backend, blockchain integration, AI decision logic*

**[Team Member 2]** - Frontend Lead & UX Designer  
*React, UI/UX, dashboard visualization*

**[Team Member 3]** - Smart Contract Developer  
*Solidity, Base network, x402 integration*

**[Team Member 4]** - Product & Business Strategy  
*SME domain expertise, market positioning*

## 📞 Contact

- **Email**: build@quiet-capital.com
- **GitHub**: github.com/quiet-capital/float
- **JengaHacks 2026**: Team Quiet Capital

## 📄 License

MIT License - © 2026 Quiet Capital

---

#JengaHacks2026 #AgenticSummer #BaseBatches #BuildOnBase

*Built for JengaHacks 2026 - Autonomous SME Treasury Agent for the Machine Economy*
