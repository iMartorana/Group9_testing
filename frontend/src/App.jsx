import { useAuth0 } from "@auth0/auth0-react";
import Login from "./pages/login";

function Dashboard() {
  return (
    <div className="container py-4">
      <h1 className="h3">Welcome to the UWM TradeSkill App</h1>
    </div>
  );
}

function Navbar({ isAuthenticated, user, onLogin, onSignup, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg bg-light border-bottom">
      <div className="container">
        <span className="navbar-brand fw-bold">UWM Trade App</span>

        <div className="ms-auto d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="small text-muted">
                {user?.email || user?.name}
              </span>
              <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline-primary btn-sm" onClick={onSignup}>
                Sign up
              </button>
              <button className="btn btn-primary btn-sm" onClick={onLogin}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}


export default function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    error,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const onLogin = () => loginWithRedirect();

  const onSignup = () =>
    loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
    });

  const onLogout = () =>
    auth0Logout({
      logoutParams: { returnTo: window.location.origin },
    });

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={onLogin}
        onSignup={onSignup}
        onLogout={onLogout}
      />

      <div className="container py-3">
        {error && <div className="alert alert-danger">{error.message}</div>}

        {!isAuthenticated ? <Login /> : <Dashboard />}
      </div>
    </>
  );
}
