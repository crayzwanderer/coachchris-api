// server.js
import express from "express";
import cors from "cors";

const app = express();

// -----------------------------
// CORS
// -----------------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// -----------------------------
// TEMPORARY IN-MEMORY REVIEWS
// (Replace with MySQL later when ready)
// -----------------------------
let reviews = [
  {
    id: 1,
    coach_id: 1,
    reviewer_name: "Test Parent",
    reviewer_role: "Parent/Guardian",
    rating: 5,
    title: "This is a working dummy review!",
    body: "If you see this on the frontend, your API is working perfectly.",
    published: 0,
    date: Date.now(),
  },
  {
    id: 2,
    coach_id: 1,
    reviewer_name: "Athlete Demo",
    reviewer_role: "Athlete",
    rating: 4,
    title: "Coach helped me level up",
    body: "Super supportive and motivating!",
    published: 0,
    date: Date.now(),
  },
];

// -----------------------------
// PUBLIC ROUTE (Only show published reviews)
// -----------------------------
app.get("/api/reviews", (req, res) => {
  const publishedOnly = reviews.filter((r) => r.published === 1);
  res.json(publishedOnly);
});

// -----------------------------
// ADMIN ROUTE (Return ALL reviews)
// -----------------------------
app.get("/api/reviews/all", (req, res) => {
  res.json(reviews);
});

// -----------------------------
// POST Review (Public submission)
// -----------------------------
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
    id: reviews.length + 1,
    coach_id,
    reviewer_name,
    reviewer_role,
    rating,
    title,
    body,
    published: 0,
    date: Date.now(),
  };

  reviews.push(newReview);
  res.status(201).json({ message: "Review added", review: newReview });
});

// -----------------------------
// PATCH Publish / Unpublish
// -----------------------------
app.patch("/api/reviews/:id/publish", (req, res) => {
  const id = Number(req.params.id);
  const { published } = req.body;

  const review = reviews.find((r) => r.id === id);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }

  review.published = published ? 1 : 0;

  res.json({
    message: "Publish status updated",
    id,
    published: review.published,
  });
});

// -----------------------------
// Health Check
// -----------------------------
app.get("/", (_, res) => {
  res.send("Coach Robinson API is running (dummy mode).");
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
