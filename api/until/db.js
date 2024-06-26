var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' })
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    charset: "utf8mb4"
})

db.connect((err) => {
    if(err){
        console.log(err)
    }else{
        console.log("MYSQL connected")
    }
})

module.exports = db;