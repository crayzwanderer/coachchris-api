import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ HEALTHCHECK — MUST BE BEFORE app.listen
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Coach Chris API is alive");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
});
