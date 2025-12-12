import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------
// MYSQL CONNECTION (Railway internal network)
// ---------------------------------------------
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});

// ---------------------------------------------
// HEALTH CHECK (REQUIRED FOR RAILWAY)
// ---------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ---------------------------------------------
// PUBLIC REVIEWS
// ---------------------------------------------
app.get("/api/reviews", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reviews WHERE published = 1 ORDER BY date DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching published reviews:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ---------------------------------------------
// ADMIN REVIEWS
// ---------------------------------------------
app.get("/api/reviews/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching all reviews:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ---------------------------------------------
// START SERVER
// ---------------------------------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
});
