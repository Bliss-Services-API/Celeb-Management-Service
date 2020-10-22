'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
      return queryInterface.createTable('celeb_profiles', {
          celeb_id:             { type: Sequelize.STRING(64), allowNull: false, primaryKey: true },
          celeb_name:           { type: Sequelize.TEXT, allowNull: false, unique: 'celebUniqueId' },
          celeb_category:       { type: Sequelize.STRING(8), allowNull: false, unique: 'celebUniqueId' },
          celeb_introduction:   { type: Sequelize.TEXT, allowNull: false, unique: true },
          celeb_joining_date:   { type: Sequelize.DATE, allowNull: false },
          celeb_image_link:     { type: Sequelize.TEXT, allowNull: false, unique: true }
        });
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.dropAllTables();
    }
};
