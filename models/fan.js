const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const CourseRegister = require("./courseRegister");
const EduFan = require("./eduFan");

const Fan = db.define("fan", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
logger.info("fan model is loaded!");

Fan.hasMany(CourseRegister, { foreignKey: "fanId" });
Fan.hasMany(EduFan, { foreignKey: "fanId" });

module.exports = Fan;
