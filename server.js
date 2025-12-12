import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();

app.use(cors());
app.use(express.json());

// ----------------------------
// MySQL pool (Railway vars)
// ----------------------------
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
  waitForConnections: true,
  connectionLimit: 10,
});

// ----------------------------
// Health check (IMPORTANT)
// ----------------------------
app.get("/", (req, res) => {
  res.send("API is alive");
});

// ----------------------------
// Routes
// ----------------------------
app.get("/api/reviews", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reviews WHERE published = 1 ORDER BY date DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ----------------------------
// Start server (ONLY ONCE)
// ----------------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
