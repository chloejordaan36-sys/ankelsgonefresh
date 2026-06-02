require("dotenv").config();

const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("ANKLES GONE AI V2 ONLINE");
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ANKLES GONE AI is running"
  });
});

// AI routes
app.use("/ask-ai", aiRoutes);

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("");
  console.log("==================================");
  console.log("🏀 ANKLES GONE AI ONLINE");
  console.log(`🌐 Server Port: ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log("==================================");
  console.log("");
});