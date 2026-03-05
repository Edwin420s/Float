'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transactions', 'paymentMethod', {
      type: Sequelize.ENUM('base', 'mpesa', 'airtel', 'mtn', 'x402'),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transactions', 'paymentMethod', {
      type: Sequelize.ENUM('base', 'mpesa', 'airtel', 'mtn'),
      allowNull: true,
    });
  }
};
