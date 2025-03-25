const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const Comment = db.define("comments", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    re,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  star: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  centerId: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Comment;
