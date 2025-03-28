const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const User = require("./user");

const Session = db.define(
  "session",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ip:{
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false
    }
  },
);

User.hasMany(Session, {foreignKey: "userId"})
Session.belongsTo(User, {foreignKey: "userId"})

module.exports = Session