const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true,
    },
    captain_status:{
        type: DataTypes.ENUM('none','pending', 'Active' ,'Deactivated'),
        defaultValue: 'none',
        allowNull: false,
    },
    customer_status:{
        type: DataTypes.ENUM('none', 'Active' ,'Deactivated'),
        defaultValue: 'none',
        allowNull: false,
    },
    deliveryman_status:{
        type: DataTypes.ENUM('none','pending', 'Active' ,'Deactivated'),
        defaultValue: 'none',
        allowNull: false,
    },
    vendor_status:{
        type: DataTypes.ENUM('none','pending', 'Active' ,'Deactivated'),
        defaultValue: 'none',
        allowNull: false,
    },
    
    profile_photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  });

  return User;
};
