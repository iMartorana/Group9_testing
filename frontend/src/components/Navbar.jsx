import { useAuth0 } from "@auth0/auth0-react";
import { Link, useLocation } from "react-router-dom";
import { Button, Container, Navbar as BsNavbar } from "react-bootstrap";
import { getRoleForEmail } from "../providers/roleStore";

export default function Navbar() {
  const { user, logout } = useAuth0();
  const location = useLocation();

  const role = getRoleForEmail(user?.email);

  const getHomePath = () => {
    if (role === "student") return "/student/dashboard";
    if (role === "client") return "/client/dashboard";
    if (role === "admin") return "/admin";
    return "/post-login";
  };

  const handleLogout = () =>
    logout({
      logoutParams: { returnTo: window.location.origin },
    });

  // eslint-disable-next-line no-unused-vars
  const navLinkClass = (path) =>
    location.pathname === path ? "fw-semibold text-primary" : "";

  return (
    <BsNavbar bg="light" expand="lg" className="border-bottom shadow-sm">
      <Container fluid className="px-4">
        <BsNavbar.Brand as={Link} to={getHomePath()} className="fw-bold fs-4">
          UWM TradeSkill App
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar" />
        <BsNavbar.Collapse id="main-navbar">
          

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="small text-muted d-none d-md-inline">
              {user?.email || user?.name}
            </span>

            <Button as={Link} to="/profile" variant="primary" size="sm">
              Profile
            </Button>

            <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}