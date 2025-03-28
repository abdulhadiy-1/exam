const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const User = require("./user");
const Region = require("./region");
const Soha = require("./soha");
const Fan = require("./fan");

const EduCenter = db.define("eduCenter", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fan: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  soha: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  star: {
    type: DataTypes.JSON,
    defaultValue: 0,
  },
});

User.hasMany(EduCenter, { foreignKey: "userId" });
EduCenter.belongsTo(User, { foreignKey: "userId" });

Region.hasMany(EduCenter, { foreignKey: "regionId" });
EduCenter.belongsTo(Region, { foreignKey: "regionId" });

module.exports = EduCenter;
