import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getRoleForEmail,
  getSignupRole,
  setRoleForEmail,
  clearSignupRole,
} from "../providers/roleStore";

export default function PostLoginRedirect() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();

  // ✅ Permanent admin(s) by email
  const ADMIN_EMAILS = ["test@uwm.edu"]; // add more if needed

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    const email = (user?.email || "").toLowerCase();

    // ✅ If admin email, always go to admin dashboard
    if (email && ADMIN_EMAILS.includes(email)) {
      navigate("/admin", { replace: true });
      return;
    }

    // if no email, default to client dashboard
    if (!email) {
      navigate("/client/dashboard", { replace: true });
      return;
    }

    // 1) existing role for this email?
    let role = getRoleForEmail(email);

    // 2) if first time right after signup, use signup_role and persist it
    if (!role) {
      const signupRole = getSignupRole();
      if (signupRole === "student" || signupRole === "client") {
        role = signupRole;
        setRoleForEmail(email, role);
        clearSignupRole();
      }
    }

    // 3) route based on role (default client)
    if (role === "student") navigate("/student/dashboard", { replace: true });
    else navigate("/client/dashboard", { replace: true });
  }, [isLoading, isAuthenticated, user, navigate]);

  return <div className="container py-4">Redirecting...</div>;
}