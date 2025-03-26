const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const Soha = require("./soha");
const EduCenter = require("./EduCenter");

const EduSoha = db.define("eduSoha", {
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
});
logger.info("eduSoha model is loaded!");

Soha.hasMany(EduSoha, { foreignKey: "sohaId" });
EduSoha.belongsTo(Soha, { foreignKey: "sohaId" });

EduCenter.hasMany(EduSoha, { foreignKey: "eduId"})
EduSoha.belongsTo(EduCenter, { foreignKey: "eduId" });

module.exports = EduSoha;
