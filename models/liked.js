const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const User = require("./user");
const EduCenter = require("./EduCenter");

const Liked = db.define("liked", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  eduId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: EduCenter,
      key: "id",
    },
    onDelete: "CASCADE",
  },
});

User.hasMany(Liked, { foreignKey: "userId", as: "likes" });
Liked.belongsTo(User, { foreignKey: "userId", as: "user" });

EduCenter.hasMany(Liked, { foreignKey: "eduId", as: "likes" });
Liked.belongsTo(EduCenter, { foreignKey: "eduId", as: "eduCenter" });

module.exports = Liked;
