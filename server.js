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
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

// ✅ DB sanity check (non-blocking)
(async () => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS db");
    console.log("🔍 CONNECTED DATABASE:", rows[0].db);
  } catch (err) {
    console.error("❌ DB CONNECTION CHECK FAILED:", err.message);
  }
})();

console.log("🧪 DB ENV CHECK: using MYSQL_URL");

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
// POST: save submission
// -----------------------------
app.post("/api/submissions", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await pool.query(
      "INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ DB INSERT ERROR FULL:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });

    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  }
});

// -----------------------------
// GET: fetch submissions
// -----------------------------
app.get("/api/submissions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM submissions ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ DB SELECT ERROR FULL:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });

    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  }
});

// -----------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
