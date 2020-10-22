'use strict';

const Sequelize = require('sequelize');

module.exports = (pgConnection) => {
    const CelebStatsModel = pgConnection.define('celeb_stat', {
        celeb_id:            { type: Sequelize.STRING(64), allowNull: false, primaryKey: true },
        celeb_shares:        { type: Sequelize.BIGINT, allowNull: false },
        celeb_likes:         { type: Sequelize.BIGINT, allowNull: false },
        celeb_response_time: { type: Sequelize.BIGINT, allowNull: false },
        celeb_response_rate: { type: Sequelize.BIGINT, allowNull: false },
        celeb_last_online:   { type: Sequelize.DATE },
    }, {
        timestamps: false
    });

    return CelebStatsModel;
};