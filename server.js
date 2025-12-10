import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------
// MYSQL CONNECTION USING RAILWAY VARIABLES
// ---------------------------------------------
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ---------------------------------------------
// ROUTES
// ---------------------------------------------
app.get("/api/reviews", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reviews WHERE published = 1 ORDER BY date DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching published reviews:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/reviews/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY date DESC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching ALL reviews:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ---------------------------------------------
app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 API running on port ${process.env.PORT || 3000}`)
);
