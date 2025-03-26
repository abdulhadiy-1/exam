const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const Region = require("./region");
const EduCenter = require("./EduCenter");

const fillial = db.define("fillial", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fanlar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sohalar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  eduId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Region.hasMany(fillial, { foreignKey: "regionId" });
fillial.belongsTo(Region, { foreignKey: "regionId" });

EduCenter.hasMany(fillial, { foreignKey: "eduId" });
fillial.belongsTo(EduCenter, { foreignKey: "eduId" });

module.exports = fillial;
