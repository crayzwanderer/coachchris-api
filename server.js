import express from "express";

const app = express();

// Health check (Railway-friendly)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 8080;

// ⚠️ IMPORTANT: only ONE listen call
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
});
