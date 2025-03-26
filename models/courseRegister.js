const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const Soha = require("./soha");
const EduCenter = require("./EduCenter");
const Fan = require("./fan");
const Fillial = require("./fillial");
const User = require("./user");

const CourseRegister = db.define("courseRegister", {
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
  fanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fillialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
logger.info("courseRegister model is loaded!");
EduCenter.hasMany(CourseRegister, { foreignKey: "eduId" });
CourseRegister.belongsTo(EduCenter, { foreignKey: "eduId" });

Fillial.hasMany(CourseRegister, { foreignKey: "filialId" });
CourseRegister.belongsTo(Fillial, { foreignKey: "filialId" });

User.hasMany(CourseRegister, { foreignKey: "userId" });
CourseRegister.belongsTo(User, { foreignKey: "userId" });

Soha.hasMany(CourseRegister, { foreignKey: "sohaId" });
CourseRegister.belongsTo(Soha, { foreignKey: "sohaId" });

Fan.hasMany(CourseRegister, { foreignKey: "fanId" });
CourseRegister.belongsTo(Fan, { foreignKey: "fanId" });
module.exports = CourseRegister;
