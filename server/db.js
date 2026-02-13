const Database = require("better-sqlite3");

const dbFile = process.env.DB_FILE || "app.db";
const db = new Database(dbFile);

// Create tables (safe to run multiple times)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auth0_sub TEXT UNIQUE,
  role TEXT CHECK(role IN ('admin','client','student')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
