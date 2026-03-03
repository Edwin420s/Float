module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Treasuries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      reservePercentage: {
        type: Sequelize.FLOAT,
        defaultValue: 50,
      },
      operationsPercentage: {
        type: Sequelize.FLOAT,
        defaultValue: 30,
      },
      smartRules: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      treasuryAddress: {
        type: Sequelize.STRING,
      },
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
    await queryInterface.dropTable('Treasuries');
  },
};