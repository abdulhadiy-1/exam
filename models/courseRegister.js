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

CourseRegister.belongsTo(Soha, { foreignKey: "sohaId" });
CourseRegister.belongsTo(EduCenter, { foreignKey: "eduId" });
CourseRegister.belongsTo(Fan, { foreignKey: "fanId" });
CourseRegister.belongsTo(Fillial, { foreignKey: "filialId" });
CourseRegister.belongsTo(User, { foreignKey: "userId" });

module.exports = CourseRegister;
