import express from "express";

const app = express();

// Health check (Railway-friendly)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 8080;

// ---------------------------------------------
// HEALTH + ROOT ROUTES (REQUIRED FOR RAILWAY)
// ---------------------------------------------
app.get("/", (req, res) => {
  res.send("CoachChris API is running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ⚠️ IMPORTANT: only ONE listen call
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
});
