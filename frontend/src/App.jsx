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
  const [auth, setAuth] = useState(null); // { role, username }
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
    setError("");
  };

  // Logged in view
  if (auth) {
    return (
      <div className="page">
        <div className="shell">
          <div className="authCard">
            <div className="left">
              <h1 className="title">
                {auth.role.charAt(0).toUpperCase() + auth.role.slice(1)} Portal
              </h1>
              <p className="subtitle">
                Signed in as <b>{auth.username}</b>
              </p>

              <div className="profile">
                <pre>{JSON.stringify(auth, null, 2)}</pre>
              </div>

              <button className="btn btnSecondary" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div className="right">
              <div className="heroOverlay">
                <div className="heroText">
                  <div className="heroHeadline">Demo Login</div>
                  <div className="heroSub">
                    Temporary local credentials (Auth0 later)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="footerNote">
            Demo accounts: admin / student / client
          </p>
        </div>
      </div>
    );
  }

  // Login form view
  return (
    <div className="page">
      <div className="shell">
        <div className="authCard">
          <div className="left">
            <h1 className="title">Sign In</h1>
            <p className="subtitle">Use a demo account to continue.</p>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / student / client"
                  autoComplete="username"
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="error">{error}</p>}

              <button className="btn" type="submit">
                Sign In
              </button>
            </form>

        
          </div>

          <div className="right">
            <div className="heroOverlay">
              <div className="heroText">
                <div className="heroHeadline">Welcome back</div>
                <div className="heroSub">
                  Role-based demo login (replace with Auth0 later)
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="footerNote">
          This is temporary. We’ll swap this to Auth0 soon.
        </p>
      </div>
    </div>
  );
}
