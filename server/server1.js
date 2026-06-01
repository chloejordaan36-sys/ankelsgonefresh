const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("DB ERROR:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

app.get("/", (req, res) => {
  res.send("ANKLES GONE AI ONLINE 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    port: PORT,
    database: "connected"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT:", PORT);
});