require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// --- SQLite setup ---
const db = new Database("app.db");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auth0_sub TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','client','student')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// --- Auth0 JWT verification ---
const jwksClient = jwksRsa.expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing bearer token" });

  jwt.verify(
    token,
    jwksClient,
    {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.user = decoded;
      next();
    }
  );
}

// Who am I? (used later for role-based routing)
app.get("/api/me", requireAuth, (req, res) => {
  const row = db
    .prepare("SELECT role, created_at FROM users WHERE auth0_sub = ?")
    .get(req.user.sub);

  if (!row) return res.json({ role: "unknown" });
  res.json(row);
});

// --- POST /api/auth/sync ---
// Called by the frontend on every login.
// Creates the user row if it doesn't exist yet, then returns their role.
app.post("/api/auth/sync", requireAuth, (req, res) => {
  const sub = req.user.sub;
  // Auth0 puts email in a namespaced claim OR the standard "email" field
  // depending on how your Auth0 Actions/Rules are configured.
  const email =
    req.user["https://capstone/email"] || req.user.email || null;

  // Insert only if this auth0_sub has never been seen before.
  // DO NOTHING means existing users (and their roles) are never overwritten.
  db.prepare(`
    INSERT INTO users (auth0_sub, email, role)
    VALUES (?, ?, 'client')
    ON CONFLICT(auth0_sub) DO NOTHING
  `).run(sub, email);

  const row = db
    .prepare("SELECT role, email, created_at FROM users WHERE auth0_sub = ?")
    .get(sub);

  res.json({ role: row.role, email: row.email });
});

// Dev helper: set your role quickly (remove later if you want)
app.post("/api/dev/set-role", requireAuth, (req, res) => {
  const { role } = req.body;
  if (!["admin", "client", "student"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  db.prepare(
    `INSERT INTO users (auth0_sub, role)
     VALUES (?, ?)
     ON CONFLICT(auth0_sub) DO UPDATE SET role=excluded.role`
  ).run(req.user.sub, role);

  res.json({ ok: true, role });
});



const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on ${port}`));

