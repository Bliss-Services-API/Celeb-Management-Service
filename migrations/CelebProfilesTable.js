'use strict';

/**
 * 
 * Migration of celeb_profiles table
 * 
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
      return queryInterface.createTable('celeb_profiles', {
          celeb_name:           { type: Sequelize.STRING, allowNull: false, primaryKey: true },
          celeb_category:       { type: Sequelize.STRING(8), allowNull: false },
          celeb_introduction:   { type: Sequelize.TEXT, allowNull: false },
          celeb_joining_date:   { type: Sequelize.DATE, allowNull: false },
          celeb_image_link:     { type: Sequelize.TEXT, allowNull: false, unique: true }
        });
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.dropTable('celeb_profiles');
    }
};
