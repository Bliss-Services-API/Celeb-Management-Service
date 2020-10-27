'use strict';

/**
 * 
 * Model of the celeb_stats table in the database celebs;
 * 
 * @param {Sequelize} databaseConnection Sequelize Object
 * 
 */
module.exports = (databaseConnection) => {
    const Sequelize = require('sequelize');

    const celebStatsModel = databaseConnection.define('celeb_stat', {
        celeb_name:          { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        celeb_shares:        { type: Sequelize.BIGINT, allowNull: false },
        celeb_likes:         { type: Sequelize.BIGINT, allowNull: false },
        celeb_response_time: { type: Sequelize.BIGINT, allowNull: false },
        celeb_response_rate: { type: Sequelize.BIGINT, allowNull: false },
        celeb_last_online:   { type: Sequelize.DATE },
    }, {
        timestamps: false
    });

    return celebStatsModel;
};