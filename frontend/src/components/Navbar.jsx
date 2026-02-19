import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
  const { user, logout } = useAuth0();

  const handleLogout = () =>
    logout({
      logoutParams: { returnTo: window.location.origin },
    });

  return (
    <nav className="navbar navbar-expand-lg border-bottom">
      <div className="container" style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        
        <span className="navbar-brand btn btn-primary">UWM TradeSkill App</span>

        <div className="d-flex gap-2">
          <button className="btn btn-primary">Home</button>
          <button className="btn btn-primary">Messages</button>
          <button className="btn btn-primary">Payments</button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="small text-black fw-bold">
            {user?.email || user?.name}
          </span>
          <button className="btn btn-primary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
