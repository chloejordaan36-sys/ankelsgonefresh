const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

/* =========================
   CONFIG
========================= */

const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* =========================
   DATABASE
========================= */

const dbPath = path.join(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ DB ERROR:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

/* =========================
   TABLES
========================= */

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      sport TEXT
    )
  `);
});

/* =========================
   HEALTH ROUTE (IMPORTANT)
========================= */

app.get("/", (req, res) => {
  res.status(200).send("ANKLES GONE AI ONLINE 🚀");
});

/* =========================
   START
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON PORT:", PORT);
});