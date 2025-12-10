// server.js (Dummy API - No Database)
import express from "express";
import cors from "cors";

const app = express();

// Allowed origins for frontend access
const allowedOrigins = [
  "https://coachchris.netlify.app",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
    methods: ["GET", "POST"],
  })
);

// Parse JSON
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Coach Robinson Dummy API is running!");
});

// Dummy reviews endpoint
app.get("/api/reviews", (req, res) => {
  const dummyReviews = [
    {
      id: 1,
      coach_id: 1,
      reviewer_name: "Test Parent",
      reviewer_role: "Parent/Guardian",
      rating: 5,
      title: "This is a working dummy review!",
      body: "If you see this on the frontend, your API is working perfectly.",
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
      date: Date.now(),
    },
  ];

  res.json(dummyReviews);
});

// Dummy POST endpoint (does not save anything)
app.post("/api/reviews", (req, res) => {
  console.log("Received new review:", req.body);
  res.json({ message: "Dummy POST received!", data: req.body });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dummy API running on port ${PORT}`);
});
