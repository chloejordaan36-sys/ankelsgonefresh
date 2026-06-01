const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/database.db");

db.run(`
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  name TEXT,
  position TEXT,
  skill_level TEXT,
  favorite_move TEXT,
  goal TEXT
)
`);

console.log("✅ Profiles table ready");