import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------
// MYSQL CONNECTION (RAILWAY-SAFE)
// ---------------------------------------------
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ---------------------------------------------
// HEALTH CHECK (VERY IMPORTANT FOR RAILWAY)
// ---------------------------------------------
app.get("/", (req, res) => {
  res.status(200).send("API is alive");
});

// ---------------------------------------------
// ROUTES
// ---------------------------------------------
app.get("/api/reviews", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reviews WHERE published = 1 ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching published reviews:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/reviews/all", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reviews ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching all reviews:", error);
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
