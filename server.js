import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type"],
  })
);

// -------------------------------
// MySQL Pool (ONLY ONE DECLARATION!)
// -------------------------------
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// -------------------------------
// GET published reviews
// -------------------------------
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

// -------------------------------
// Admin: get ALL reviews
// -------------------------------
app.get("/api/reviews/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching ALL reviews:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------------------
// POST: create review
// -------------------------------
app.post("/api/reviews", async (req, res) => {
  const { coach_id, reviewer_name, reviewer_role, rating, title, body } =
    req.body;

  if (
    !coach_id ||
    !reviewer_name ||
    !reviewer_role ||
    !rating ||
    !title ||
    !body
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const now = Date.now();

    const [result] = await pool.query(
      `INSERT INTO reviews (coach_id, reviewer_name, reviewer_role, rating, title, body, published, date, source)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'Web')`,
      [coach_id, reviewer_name, reviewer_role, rating, title, body, now]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("❌ Error inserting review:", err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// -------------------------------
// PATCH: publish toggle
// -------------------------------
app.patch("/api/reviews/:id/publish", async (req, res) => {
  const id = req.params.id;
  const published = req.body.published ? 1 : 0;

  try {
    await pool.query("UPDATE reviews SET published = ? WHERE id = ?", [
      published,
      id,
    ]);

    res.json({ id, published, message: "Updated" });
  } catch (err) {
    console.error("❌ Error updating publish status:", err);
    res.status(500).json({ error: "Database update error" });
  }
});

// -------------------------------
app.get("/", (req, res) => {
  res.send("Coach Robinson API is running with MySQL 🚀");
});

// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 API running on port", PORT));
