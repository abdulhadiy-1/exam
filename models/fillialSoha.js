const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const Soha = require("./soha");
const Fillial = require("./fillial");

const FillialSoha = db.define("fillialSoha", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fillialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sohaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
logger.info("fillialSoha model is loaded!");

Soha.belongsToMany(Fillial, {  through: FillialSoha,as: "sohalars", foreignKey: "sohaId", });
Fillial.belongsToMany(Soha, {  through: FillialSoha,as: "sohalars", foreignKey: "fillialId", });

module.exports = FillialSoha;
