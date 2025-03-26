const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const Fan = require("./fan");
const EduCenter = require("./EduCenter");

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
logger.info("eduFan model is loaded!");

Fan.hasMany(EduFan, { foreignKey: "fanId" });
EduFan.belongsTo(Fan, { foreignKey: "fanId" });

EduCenter.hasMany(EduFan, { foreignKey: "eduId" });
EduFan.belongsTo(EduCenter, { foreignKey: "eduId" });

module.exports = EduFan;
