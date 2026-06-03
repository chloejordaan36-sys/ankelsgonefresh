require("dotenv").config();

const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/aiRoutes");

const app = express();

// =====================
// BODY PARSER
// =====================
app.use(express.json({ limit: "1mb" }));

// =====================
// CORS FIX (IMPORTANT FOR RAILWAY + CLOUD FRONTENDS)
// =====================
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.0.27:3000",
  "https://jury-acquisition-twin-tank.trycloudflare.com"
];

// fallback safety (prevents undefined breaking CORS)
if (!allowedOrigins.includes("https://jury-acquisition-twin-tank.trycloudflare.com")) {
  allowedOrigins.push("https://jury-acquisition-twin-tank.trycloudflare.com");
}

app.use(cors({
  origin: true,
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

// AI ROUTES
app.use("/ask-ai", aiRoutes);

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("ANKLES GONE AI RUNNING ON", PORT);
});