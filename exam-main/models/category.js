const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");

const Category = db.define("category", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
logger.info("Category model is loaded!");


module.exports = Category;