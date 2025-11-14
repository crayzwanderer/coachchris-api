// db.js
require("dotenv").config(); // Load environment variables from .env
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST, // e.g., "monorail.proxy.rlwy.net"
  user: process.env.DB_USER, // e.g., "coachuser"
  password: process.env.DB_PASSWORD, // e.g., "coachpass123!"
  database: process.env.DB_NAME, // e.g., "coachdb"
  port: process.env.DB_PORT || 3306, // Optional fallback to 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = { pool };
