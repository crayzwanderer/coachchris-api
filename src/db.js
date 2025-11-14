// db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "coachchris-api.up.railway.app/api/reviews",
  user: "coachuser",
  password: "coachpass123!",
  database: "coachdb",
});

module.exports = { pool };
