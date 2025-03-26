const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const logger = require("../middlewares/logger");
const EduCenter = require("./EduCenter");
const User = require("./user");

const Comment = db.define("comments", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  star: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
logger.info("comment model is loaded!");

User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

EduCenter.hasMany(Comment, { foreignKey: "eduId" });
Comment.belongsTo(EduCenter, { foreignKey: "eduId" });

module.exports = Comment;
