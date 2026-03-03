module.exports = (sequelize, DataTypes) => {
  const Treasury = sequelize.define('Treasury', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reservePercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 50,
    },
    operationsPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 30,
    },
    // JSON field for smart rules like: [{ condition: "balance > 50000", action: "moveToReserve" }]
    smartRules: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    // On-chain treasury address (Base smart wallet)
    treasuryAddress: {
      type: DataTypes.STRING,
    },
  });

  Treasury.associate = (models) => {
    Treasury.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Treasury;
};