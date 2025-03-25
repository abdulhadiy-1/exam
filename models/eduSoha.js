const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

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

module.exports = EduSoha;
