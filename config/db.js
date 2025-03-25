const {Sequelize} = require("sequelize")

const db = new Sequelize("n17", "root", "1234", {
    host: "localhost",
    dialect: "mysql",
})

async function connectDb(){
    try{
        await db.authenticate()
        console.log("Connection has been established successfully.")
        // await db.sync({force: true})
        console.log("All models were synchronized successfully.")
    }catch(error){
        console.log("Unable to connect to the database:", error)
    }
}

module.exports = {db, connectDb}