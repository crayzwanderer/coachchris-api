import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ POST: Add a new review
app.post("/api/reviews", async (req, res) => {
  try {
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

    const [result] = await pool.execute(
      `INSERT INTO reviews 
        (coach_id, reviewer_name, reviewer_role, rating, title, body, published, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [coach_id, reviewer_name, reviewer_role, rating, title, body, 0, "Web"]
    );

    res.status(201).json({ message: "Review inserted!", id: result.insertId });
  } catch (err) {
    console.error("[POST /api/reviews] ERROR:", err);
    res.status(500).json({
      error: "Failed to insert review.",
      details: err.message,
    });
  }
});

// ✅ GET: ALL reviews (admin)
app.get("/api/reviews/all", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM reviews ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/reviews/all]", err);
    res.status(500).json({ error: "Failed to fetch all reviews." });
  }
});

// ✅ GET: Only PUBLISHED reviews (public)
app.get("/api/reviews", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM reviews ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/reviews]", err);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

// ✅ Root health check
app.get("/", (req, res) => {
  res.send("🚀 Coach Robinson Reviews API is running!");
});

// Start server
app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
