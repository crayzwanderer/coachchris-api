import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// DB CONNECTION
// --------------------
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// --------------------
// HEALTHCHECK (Railway)
// --------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// --------------------
// ROOT TEST
// --------------------
app.get("/", (req, res) => {
  res.send("Coach Chris API is alive");
});

// --------------------
// POST: FORM → DB
// --------------------
app.post("/api/submissions", async (req, res) => {
  const { name, role, rating, title, message } = req.body;

  try {
    // Get coach_id (fallback if missing)
    const [[coach]] = await pool.query("SELECT id FROM coaches LIMIT 1");

    await pool.query(
      `INSERT INTO reviews 
        (coach_id, reviewer_name, reviewer_role, rating, title, body, published, source)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'Web')`,
      [
        coach.id,
        name,
        role || "Client",
        rating || 5,
        title || "Website Submission",
        message,
      ]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ INSERT ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// --------------------
// GET: DISPLAY SUBMISSIONS
// --------------------
app.get("/api/submissions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT reviewer_name, reviewer_role, rating, title, body, created_at
       FROM reviews
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// --------------------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
