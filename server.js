import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// -------------------------------------
// MySQL Pool
// -------------------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// -------------------------------------
// GET published reviews (public)
// -------------------------------------
app.get("/api/reviews", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reviews WHERE published = 1 ORDER BY date DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------------------------
// GET all reviews (admin)
// -------------------------------------
app.get("/api/reviews/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------------------------
// POST create review
// -------------------------------------
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
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// -------------------------------------
// PATCH publish toggle
// -------------------------------------
app.patch("/api/reviews/:id/publish", async (req, res) => {
  const id = req.params.id;
  const { published } = req.body;

  try {
    await pool.query("UPDATE reviews SET published = ? WHERE id = ?", [
      published ? 1 : 0,
      id,
    ]);

    res.json({ message: "Updated", id, published });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Database update error" });
  }
});

// -------------------------------------
app.get("/", (req, res) => {
  res.send("Coach Robinson API is running with MySQL 🚀");
});

// -------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on:", PORT));
