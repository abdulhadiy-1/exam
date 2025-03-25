const { DataTypes } = require("sequelize");
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