import { useMemo, useState } from "react";
import "./App.css";

const DEMO_USERS = [
  { role: "admin", username: "admin", password: "Admin@123" },
  { role: "student", username: "student", password: "Student@123" },
  { role: "client", username: "client", password: "Client@123" },
];

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState("");

  const usersByUsername = useMemo(() => {
    const map = new Map();
    DEMO_USERS.forEach((u) => map.set(u.username, u));
    return map;
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const u = usersByUsername.get(username.trim());
    if (!u || u.password !== password) {
      setError("Invalid username or password.");
      return;
    }

    setAuth({ role: u.role, username: u.username });
    setUsername("");
    setPassword("");
  };

  const handleLogout = () => {
    setAuth(null);
  };

  // ✅ LOGGED-IN VIEW
  if (auth) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card p-4 shadow-sm text-center">
          <h2>
            {auth.role.charAt(0).toUpperCase() + auth.role.slice(1)} Portal
          </h2>
          <p>Signed in as <b>{auth.username}</b></p>

          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // ✅ LOGIN VIEW (Bootstrap form)
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="h3 mb-2">Sign In</h1>
                <p className="text-muted mb-4">
                  Use a demo account to continue.
                </p>

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin / student / client"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2">{error}</div>
                  )}

                  <button className="btn btn-primary w-100" type="submit">
                    Sign In
                  </button>
                </form>

                <div className="small text-muted mt-3">
                  Demo accounts: admin / student / client
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
