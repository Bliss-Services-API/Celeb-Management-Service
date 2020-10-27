'use strict';

/**
 * 
 * Model of the celeb_profiles table in the database celebs;
 * 
 * @param {Sequelize} databaseConnection Sequelize Object
 * 
 */
module.exports = (databaseConnection) => {
    const Sequelize = require('sequelize');
    
    const celebProfileModel = databaseConnection.define('celeb_profile', {
        celeb_name:           { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        celeb_category:       { type: Sequelize.STRING(8), allowNull: false },
        celeb_introduction:   { type: Sequelize.TEXT, allowNull: false, unique: true },
        celeb_image_link:     { type: Sequelize.TEXT, allowNull: false, unique: true }
    }, {
        timestamps: true,
        updatedAt: false,
        createdAt: 'celeb_joining_date'
    });
    return celebProfileModel;
};