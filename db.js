const sqlite3 = require("sqlite3").verbose();

// creates or opens database file
const db = new sqlite3.Database("./database.db");

module.exports = db;