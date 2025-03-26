const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const EduCenter = db.define("EduCenter", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  licetion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  soha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = EduCenter;
