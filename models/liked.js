const { DataTypes } = require("sequelize");
<<<<<<< HEAD
const { db } = require("../config/db");
const logger = require("../middlewares/logger");

const liked = db.define("liked", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  eduId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
logger.info("liked model is loaded!");

module.exports = liked;
=======
const {db} = require("../config/db");

const liked = db.define("liked", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    eduId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});


module.exports = liked;
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
