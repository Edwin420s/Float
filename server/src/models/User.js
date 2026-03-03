module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    companyName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
    },
    // Simulated mobile money identifiers
    mpesaNumber: {
      type: DataTypes.STRING,
    },
    airtelNumber: {
      type: DataTypes.STRING,
    },
    mtnNumber: {
      type: DataTypes.STRING,
    },
  });

  User.associate = (models) => {
    User.hasOne(models.Treasury, { foreignKey: 'userId' });
    User.hasMany(models.Transaction, { foreignKey: 'userId' });
  };

  return User;
};