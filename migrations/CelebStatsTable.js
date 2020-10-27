'use strict';

/**
 * 
 * Migration of celeb_stats table
 * 
 */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('celeb_stats', {
            celeb_name:          { type: Sequelize.STRING, allowNull: false, primaryKey: true, references: {
                                            model: 'celeb_profiles',
                                            key: 'celeb_name',
                                 }, onUpdate: 'cascade', onDelete: 'cascade' },
            celeb_shares:        { type: Sequelize.BIGINT, allowNull: false },
            celeb_likes:         { type: Sequelize.BIGINT, allowNull: false },
            celeb_response_time: { type: Sequelize.BIGINT, allowNull: false },
            celeb_response_rate: { type: Sequelize.BIGINT, allowNull: false },
            celeb_last_online:   { type: Sequelize.DATE, allowNull: false }
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('celeb-stats');
    }
};