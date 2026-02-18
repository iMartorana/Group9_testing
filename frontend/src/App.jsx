import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";

const DEMO_USERS = [
  { role: "admin", username: "admin", password: "Admin@123" },
  { role: "student", username: "student", password: "Student@123" },
  { role: "client", username: "client", password: "Client@123" },
];

function Navbar({ isAuthenticated, user, onLogin, onSignup, onLogout }) {
  return (
    <nav className="navbar">
      <span style={{ fontWeight: 700, fontSize: "18px" }}>UWM Skill Trade</span>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: "14px" }}>{user?.email}</span>
            <button className="btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn" onClick={onSignup}>Signup</button>

            <button className="btn" onClick={onLogin}>Login</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const {
    isLoading, // Loading state, the SDK needs to reach Auth0 on load
    isAuthenticated,
    error,
    loginWithRedirect: login, // Starts the login flow
    logout: auth0Logout, // Starts the logout flow
    user, // User profile
  } = useAuth0();

  const signup = () => login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={login}
        onSignup={signup}
        onLogout={logout}
      />

      <div className="page">
        {isAuthenticated ? (
          <div className="shell">
            <h1>User Profile</h1>
            <pre className="profile">{JSON.stringify(user, null, 2)}</pre>
          </div>
        ) : (
          <div className="shell">
            {error && <p className="error">Error: {error.message}</p>}
            <p>Please log in or sign up to continue.</p>
          </div>
        )}
      </div>
    </>
  );
}

