// server.js
import express from "express";
import cors from "cors";
import db from "./src/db.js";

const app = express();

/* ---------------------------------------------------
   CORS – allow Netlify + local dev
--------------------------------------------------- */
const allowedOrigins = [
  "https://coachchris.netlify.app",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

/* ---------------------------------------------------
   Health check
--------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Coach Robinson Reviews API is running");
});

/* ---------------------------------------------------
   Mock reviews (temporary)
--------------------------------------------------- */
let reviews = [
  {
    id: 1,
    coach_id: 1,
    reviewer_name: "Jordan R.",
    reviewer_role: "Athlete",
    rating: 5,
    title: "Confidence through the roof",
    body: "Coach Robinson pushed me in all the right ways.",
    date: Date.now() - 1000 * 60 * 60 * 24 * 3,
    published: true,
    source: "Mock",
  },
];

let nextId = reviews.length + 1;

app.get("/api/reviews", (req, res) => {
  const sorted = [...reviews].sort((a, b) => b.date - a.date);
  res.json(sorted);
});

app.post("/api/reviews", (req, res) => {
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

  const newReview = {
    id: nextId++,
    coach_id,
    reviewer_name,
    reviewer_role,
    rating: Number(rating),
    title,
    body,
    date: Date.now(),
    published: true,
    source: "Web (mock)",
  };

  reviews.push(newReview);
  res.status(201).json(newReview);
});

/* ---------------------------------------------------
   DB test route (THIS IS THE WIN)
--------------------------------------------------- */
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM submissions LIMIT 1");
    res.json({ success: true, rows });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------
   Railway health check (REQUIRED)
--------------------------------------------------- */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* ---------------------------------------------------
   Start server (Railway-safe)
--------------------------------------------------- */
const PORT = Number(process.env.PORT) || 8080;

console.log("🔎 USING PORT:", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
