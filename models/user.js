const Region = require("./region");
const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");

const User = db.define("user", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Region, 
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  }  
});

logger.info("User model is loaded!");

Region.hasMany(User, { foreignKey: "regionId" });
User.belongsTo(Region, { foreignKey: "regionId" });

module.exports = User;
