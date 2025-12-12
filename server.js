import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Healthcheck — REQUIRED for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("Coach Chris API is alive");
});

const PORT = process.env.PORT;

// ❗ IMPORTANT: DO NOT bind host
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
