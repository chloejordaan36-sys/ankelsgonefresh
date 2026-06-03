require("dotenv").config();

const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/aiRoutes");

const app = express();

// IMPORTANT FIX (prevents payload crash)
app.use(express.json({ limit: "1mb" }));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.0.27:3000",
    "https://depot-houses-cups-min.trycloudflare.com",
    "https://ankelsgonefresh-production.up.railway.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("ANKLES GONE AI ONLINE");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/ask-ai", aiRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("ANKLES GONE AI RUNNING ON", PORT);
});