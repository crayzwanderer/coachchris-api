import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// MySQL connection pool
// -----------------------------
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
  waitForConnections: true,
  connectionLimit: 10,
});

// -----------------------------
// Healthcheck (Railway REQUIRED)
// -----------------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// -----------------------------
// Root test
// -----------------------------
app.get("/", (req, res) => {
  res.send("Coach Chris API is alive");
});

// -----------------------------
// POST: save form submission
app.post("/api/submissions", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await pool.query(
      "INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ DB INSERT ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------
// GET: fetch submissions
app.get("/api/submissions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM submissions ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ DB SELECT ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
