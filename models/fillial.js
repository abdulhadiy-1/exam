const { DataTypes } = require("sequelize");
<<<<<<< HEAD
const { db } = require("../config/db");
const logger = require("../middlewares/logger");

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
logger.info("fillial model is loaded!");

module.exports = fillial;
=======
const {db} = require("../config/db");


const fillial = db.define("fillial", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
   name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    regionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fanlar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sohalar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    eduId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },

   
});

module.exports = fillial;
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
