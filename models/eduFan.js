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

Fan.belongsToMany(EduCenter, {  through: EduFan,as: "fans", foreignKey: "fanId", });
EduCenter.belongsToMany(Fan, {  through: EduFan, as: "fans",foreignKey: "eduId", });


module.exports = EduFan;
