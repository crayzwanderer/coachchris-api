// server.js
import express from "express";
import cors from "cors";

const app = express();

/* ---------------------------------------------------
   MIDDLEWARE — MUST COME FIRST
--------------------------------------------------- */
app.use(
  cors({
    origin: [
      "https://coachchris.netlify.app",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5501",
      "http://localhost:5500",
      "http://localhost:5501",
    ],
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type"], // ✅ important
  })
);

// ✅ JSON parser (required for req.body)
app.use(express.json());

// ✅ Optional but recommended (form-encoded safety)
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------------------
   HEALTH CHECK
--------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Coach Robinson API running");
});

/* ---------------------------------------------------
   CONTACT FORM
--------------------------------------------------- */
app.post("/api/contact", (req, res) => {
  console.log("📦 HEADERS:", req.headers);
  console.log("📦 BODY:", req.body);
  console.log("🔥 CONTACT ROUTE VERSION: SAFE-NO-DESTRUCTURE");

  // 🚨 DO NOT DESTRUCTURE UNTIL WE VERIFY
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      error: "Invalid or missing JSON body",
    });
  }

  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  console.log("📬 Contact received:", { name, email, message });

  return res.status(201).json({ success: true });
});

/* ---------------------------------------------------
   START SERVER (RAILWAY SAFE)
--------------------------------------------------- */
const PORT = process.env.PORT || 8080;
console.log("🔎 USING PORT:", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
