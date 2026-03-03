module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USDC',
    },
    recipient: {
      type: DataTypes.STRING, // could be wallet address or mobile number
    },
    type: {
      type: DataTypes.ENUM('payment', 'transfer', 'fee', 'deposit'),
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.ENUM('base', 'mpesa', 'airtel', 'mtn'),
    },
    txHash: {
      type: DataTypes.STRING, // on-chain transaction hash
    },
    metadata: {
      type: DataTypes.JSONB,
    },
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Transaction;
};