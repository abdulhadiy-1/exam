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

EduSoha.belongsTo(EduCenter, { foreignKey: "eduId" });
EduSoha.belongsTo(Soha, { foreignKey: "sohaId" });

module.exports = EduSoha;
