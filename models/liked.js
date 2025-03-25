const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");

const liked = db.define("liked", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  eduId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
logger.info("liked model is loaded!");

module.exports = liked;
