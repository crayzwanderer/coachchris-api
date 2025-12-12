import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------
// MYSQL CONNECTION (Railway)
// ---------------------------------------------
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional sanity check (safe)
console.log("🧪 DB Config Check:", {
  host: process.env.MYSQLHOST ? "OK" : "MISSING",
  user: process.env.MYSQLUSER ? "OK" : "MISSING",
  database: process.env.MYSQLDATABASE ? "OK" : "MISSING",
  port: process.env.MYSQLPORT ? "OK" : "MISSING",
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
  } catch (err) {
    console.error("❌ Published reviews error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/reviews/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ All reviews error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ---------------------------------------------
// START SERVER (ONLY ONCE)
// ---------------------------------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
