'use strict';

const Sequelize = require('sequelize');

module.exports = (DBConnection) => {
    const CelebProfileModel = DBConnection.define('celeb_profile', {
        celeb_id:             { type: Sequelize.STRING(64), allowNull: false, primaryKey: true },
        celeb_name:           { type: Sequelize.TEXT, allowNull: false, unique: 'celebUniqueId' },
        celeb_category:       { type: Sequelize.STRING(8), allowNull: false, unique: 'celebUniqueId' },
        celeb_introduction:   { type: Sequelize.TEXT, allowNull: false, unique: true },
        celeb_image_link:     { type: Sequelize.TEXT, allowNull: false, unique: true}
    }, {
        timestamps: true,
        updatedAt: false,
        createdAt: 'celeb_joining_date'
    });
    return CelebProfileModel;
};