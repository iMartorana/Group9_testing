import { useAuth0 } from "@auth0/auth0-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth0();

  const onLogout = () =>
    logout({
      logoutParams: { returnTo: window.location.origin },
    });

  return (
    <>
      {/* Top bar (old navbar style) */}
      <nav className="navbar navbar-expand-lg bg-light border-bottom">
        <div className="container">
          <span className="navbar-brand fw-bold">UWM TradeSkill App</span>

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="small text-muted">
              {user?.email || user?.name}
            </span>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="container py-4">
        <h1 className="display-5 text-danger fw-bold">ADMIN DASHBOARD</h1>

        <p className="lead">You are logged in as an admin.</p>
      </div>
    </>
  );
}
