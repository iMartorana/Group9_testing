import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
  const { user, logout } = useAuth0();

  const handleLogout = () =>
    logout({
      logoutParams: { returnTo: window.location.origin },
    });

  return (
    <nav className="navbar navbar-expand-lg bg-light border-bottom">
      <div className="container">

        <span className="navbar-brand fw-bold btn">
          UWM TradeSkill App
        </span>

        <div className="d-flex gap-2">
          <button className="btn">Home</button>
          <button className="btn">Messages</button>
          <button className="btn">Payments</button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="small text-muted">
            {user?.email || user?.name}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}
