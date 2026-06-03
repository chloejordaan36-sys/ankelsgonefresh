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
  process.env.FRONTEND_URL
];

// fallback safety (prevents undefined breaking CORS)
if (!allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server / Postman
      if (!origin) return callback(null, true);

      // allow trusted origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);

      // TEMP: allow everything in production debugging
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT: handle preflight requests
app.options("*", cors());

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