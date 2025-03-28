const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const Fan = require("./fan");
const Fillial = require("./fillial");

const FillialFan = db.define("fillialFan", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fillialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
logger.info("fillialFan model is loaded!");

Fan.belongsToMany(Fillial, {  through: FillialFan,as: "fanlars", foreignKey: "fanId", });
Fillial.belongsToMany(Fan, {  through: FillialFan,as: "fanlars", foreignKey: "fillialId", });

module.exports = FillialFan;
