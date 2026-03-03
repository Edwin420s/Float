module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      companyName: Sequelize.STRING,
      email: Sequelize.STRING,
      phone: Sequelize.STRING,
      mpesaNumber: Sequelize.STRING,
      airtelNumber: Sequelize.STRING,
      mtnNumber: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  },
};