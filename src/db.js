// db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "coachuser",
  password: "coachpass123!",
  database: "coachdb",
});

module.exports = { pool };
