require("dotenv").config();
console.log("DEPLOY TEST COMMIT 74a1b17");

const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/aiRoutes");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== LOG EVERY REQUEST (VERY IMPORTANT) =====
app.use((req, res, next) => {
  console.log("\n==============================");
  console.log("NEW REQUEST RECEIVED");
  console.log("==============================");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  next();
});

// ===== Root route =====
app.get("/", (req, res) => {
  res.send("ANKLES GONE AI V2 ONLINE");
});

app.get("/ollama-health", async (req, res) => {
  try {
    const r = await fetch(`${process.env.OLLAMA_URL}/api/tags`);
    const data = await r.json();
    res.json({ ok: true, models: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ===== Health check =====
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ANKLES GONE AI is running"
  });
});

// ===== AI routes =====
app.use("/ask-ai", aiRoutes);

// ===== ERROR HANDLER (IMPORTANT FOR RAILWAY DEBUGGING) =====
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n==================================");
  console.log("ENV OLLAMA_URL:", process.env.OLLAMA_URL);
  console.log("🏀 ANKLES GONE AI ONLINE");
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log("==================================\n");
});