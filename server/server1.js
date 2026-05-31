const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();

/* =========================
   CONFIG
========================= */

const PORT = process.env.PORT || 3000;

const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  "http://127.0.0.1:11434/api/generate";

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* =========================
   DATABASE SETUP
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

  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS long_term_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      type TEXT,
      content TEXT,
      importance INTEGER DEFAULT 1,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS player_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      skill TEXT,
      value INTEGER,
      notes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS player_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT UNIQUE,
      position TEXT,
      height TEXT,
      weight TEXT,
      age INTEGER,
      dominant_hand TEXT,
      skill_level TEXT,
      strengths TEXT,
      weaknesses TEXT,
      goal TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  console.log("ROOT HIT");
  res.send("ANKLES GONE AI ONLINE 🚀");
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 ANKLES GONE AI SERVER LIVE
PORT: ${PORT}
MODE: HYBRID COACH + STREETBALL AI
STATUS: READY
  `);
});