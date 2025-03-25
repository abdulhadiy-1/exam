const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const EduFan = db.define("eduFan", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  eduId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = EduFan;
