// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------
// DUMMY DATA (used until database added)
// -----------------------------------------
let dummyReviews = [
  {
    id: 1,
    coach_id: 1,
    reviewer_name: "Test Parent",
    reviewer_role: "Parent/Guardian",
    rating: 5,
    title: "This is a working dummy review!",
    body: "If you see this on the frontend, your API is working perfectly.",
    date: Date.now(),
    published: true,
  },
  {
    id: 2,
    coach_id: 1,
    reviewer_name: "Athlete Demo",
    reviewer_role: "Athlete",
    rating: 4,
    title: "Coach helped me level up",
    body: "Super supportive and motivating!",
    date: Date.now(),
    published: false,
  },
];

// -----------------------------------------
// PUBLIC ROUTE – returns only published reviews
// -----------------------------------------
app.get("/api/reviews", (req, res) => {
  const publishedReviews = dummyReviews.filter((r) => r.published);
  res.json(publishedReviews);
});

// -----------------------------------------
// ADMIN ROUTE – returns ALL reviews
// -----------------------------------------
app.get("/api/reviews/all", (req, res) => {
  res.json(dummyReviews);
});

// -----------------------------------------
// POST – submit new review
// -----------------------------------------
app.post("/api/reviews", (req, res) => {
  const { coach_id, reviewer_name, reviewer_role, rating, title, body } =
    req.body;

  if (!reviewer_name || !reviewer_role || !rating || !title || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newReview = {
    id: dummyReviews.length + 1,
    coach_id,
    reviewer_name,
    reviewer_role,
    rating,
    title,
    body,
    date: Date.now(),
    published: false, // default: hidden until admin publishes
  };

  dummyReviews.push(newReview);
  res.status(201).json({ message: "Review added", review: newReview });
});

// -----------------------------------------
// PATCH – toggle published/unpublished
// -----------------------------------------
app.patch("/api/reviews/:id/publish", (req, res) => {
  const id = Number(req.params.id);
  const { published } = req.body;

  const review = dummyReviews.find((r) => r.id === id);
  if (!review) return res.status(404).json({ error: "Review not found" });

  review.published = Boolean(published);

  res.json({ message: "Publish status updated", review });
});

// -----------------------------------------
// START SERVER
// -----------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
