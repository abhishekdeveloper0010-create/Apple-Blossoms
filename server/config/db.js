const mysql = require("mysql2");

require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "appleblossom",
  port: Number(process.env.DB_PORT || 3306),
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = db;