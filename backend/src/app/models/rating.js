const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rating = sequelize.define('Rating', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ride_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rated_by: {
      type: DataTypes.INTEGER, // User who gave the rating
      allowNull: false,
    },
    rated_user: {
      type: DataTypes.INTEGER, // User who received the rating
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Rating.associate = (models) => {
    Rating.belongsTo(models.Ride, {
      foreignKey: 'ride_id',
      as: 'ride',
    });
    Rating.belongsTo(models.User, {
      foreignKey: 'rated_by',
      as: 'rater',
    });
    Rating.belongsTo(models.User, {
      foreignKey: 'rated_user',
      as: 'ratee',
    });
  };

  return Rating;
};
