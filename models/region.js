const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");

const Region = db.define("region", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
logger.info("Region model is loaded!");


module.exports = Region;