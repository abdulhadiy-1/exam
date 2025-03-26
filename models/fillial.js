const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const fillial = db.define("fillial", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fanlar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sohalar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  eduId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = fillial;
