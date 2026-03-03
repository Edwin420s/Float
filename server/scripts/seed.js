const { sequelize, User, Treasury, Transaction } = require('../src/models');
const logger = require('../src/utils/logger');

async function seed() {
  try {
    await sequelize.sync({ force: true }); // drops existing tables

    // Create a demo user
    const user = await User.create({
      walletAddress: '0xDemoWalletAddress123',
      companyName: 'Demo SME Ltd',
      email: 'demo@sme.com',
      phone: '+254700000000',
      mpesaNumber: '254700000001',
      airtelNumber: '254700000002',
      mtnNumber: '256700000003',
    });

    // Create treasury
    await Treasury.create({
      userId: user.id,
      reservePercentage: 50,
      operationsPercentage: 30,
      smartRules: [
        { condition: 'balance > 50000', action: 'move 20% to reserve' },
      ],
      treasuryAddress: '0xMockTreasuryAddress',
    });

    // Create some transactions
    await Transaction.bulkCreate([
      {
        userId: user.id,
        amount: 6000,
        currency: 'USDC',
        recipient: 'Supplier Co.',
        type: 'payment',
        status: 'completed',
        paymentMethod: 'base',
        txHash: '0xabcdef1234567890',
        metadata: { invoiceId: 'inv_001' },
      },
      {
        userId: user.id,
        amount: 2000,
        currency: 'USDC',
        recipient: 'Agent Risk Oracle',
        type: 'fee',
        status: 'completed',
        paymentMethod: 'x402',
        txHash: '0x1234567890abcdef',
        metadata: { service: 'risk-score' },
      },
    ]);

    logger.info('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', error);
    process.exit(1);
  }
}

seed();