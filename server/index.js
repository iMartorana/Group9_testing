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
