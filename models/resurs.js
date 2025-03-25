const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const User = require("./user");
const Category = require("./category");

const Resurs = db.define("resurs", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  media: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
logger.info("Resurs model is loaded!");

User.hasMany(Resurs, { foreignKey: "userId" });
Resurs.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Resurs, { foreignKey: "categoryId" });
Resurs.belongsTo(Category, { foreignKey: "categoryId" });

module.exports = Resurs;