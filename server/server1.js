const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

/* IMPORTANT */
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "database.db");

const db = new sqlite3.Database(dbPath);

app.get("/", (req, res) => {
  res.send("ANKLES GONE API LIVE 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT:", PORT);
});