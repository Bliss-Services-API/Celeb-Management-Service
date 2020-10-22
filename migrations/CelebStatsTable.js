'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('celeb_stats', {
            celeb_id:            { type: Sequelize.STRING(64), allowNull: false, primaryKey: true, references: {
                                        model: 'celeb_profiles',
                                        key: 'celeb_id',
                                   }, onUpdate: 'cascade', onDelete: 'cascade' },
            celeb_shares:        { type: Sequelize.BIGINT, allowNull: false },
            celeb_likes:         { type: Sequelize.BIGINT, allowNull: false },
            celeb_response_time: { type: Sequelize.BIGINT, allowNull: false },
            celeb_response_rate: { type: Sequelize.BIGINT, allowNull: false },
            celeb_last_online:   { type: Sequelize.DATE },
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('celeb-stats');
    }
};