const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const CourseRegister = db.define("courseRegister", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  eduId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sohaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fillialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = CourseRegister;
