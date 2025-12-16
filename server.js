import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// MySQL connection pool
// -----------------------------
const pool = mysql.createPool(process.env.MYSQL_URL);

const [dbCheck] = await pool.query("SELECT DATABASE() AS db");
console.log("🔍 CONNECTED DATABASE:", dbCheck[0].db);

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
  console.error("❌ DB ERROR FULL:", {
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
    console.error("❌ DB SELECT ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
