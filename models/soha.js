const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const CourseRegister = require("./courseRegister");
const EduSoha = require("./eduSoha");
const EduFan = require("./eduFan");

const Soha = db.define("soha", {
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
logger.info("soha model is loaded!");

Soha.hasMany(CourseRegister, { foreignKey: "sohaId" });
Soha.hasMany(EduSoha, { foreignKey: "sohaId" });

module.exports = Soha;
