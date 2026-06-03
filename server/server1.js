require("dotenv").config();

const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/aiRoutes"); // IMPORTANT

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json({ limit: "1mb" }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors());

// =====================
// ROUTES
// =====================
app.get("/", (req, res) => {
  res.send("ANKLES GONE AI ONLINE");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/ask-ai", aiRoutes);

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("ANKLES GONE AI RUNNING ON", PORT);
});