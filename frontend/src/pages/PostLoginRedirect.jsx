import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getUserByEmail } from "../services/supabaseapi";
import {
  getSignupRole,
  setRoleForEmail,
} from "../providers/roleStore";
/*
Determine what to load after auth0 handles login
Sign up automatically leads to login, so auth0 covers both

Basic account information uses localStorage. Functions can be found in roleStore.js
*/
export default function PostLoginRedirect() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();

  const ADMIN_EMAILS = ["test@uwm.edu"];//While not a password, is still somewhat risky

  useEffect(() => {
    const redirectUser = async () => {
      if (isLoading || !isAuthenticated) return;

      const email = (user?.email || "").toLowerCase();

      if (email && ADMIN_EMAILS.includes(email)) {
        navigate("/admin", { replace: true });
        return;
      }

      if (!email) {
        navigate("/client/dashboard", { replace: true });
        return;
      }

      try {
        const { data, error } = await getUserByEmail(email);

        if (!error && data?.role) {
          setRoleForEmail(email, data.role);//localStorage set role

          if (data.role === "student") {
            navigate("/student/dashboard", { replace: true });
            return;
          }

          if (data.role === "client") {
            navigate("/client/dashboard", { replace: true });
            return;
          }

          if (data.role === "admin") {
            navigate("/admin", { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch role from database:", err);
      }

      const signupRole = getSignupRole();
      if (signupRole === "student" || signupRole === "client") {
        setRoleForEmail(email, signupRole);

        if (signupRole === "student") {
          navigate("/student/dashboard", { replace: true });
          return;
        }

        navigate("/client/dashboard", { replace: true });
        return;
      }

      navigate("/client/dashboard", { replace: true });
    };

    redirectUser();
  }, [isLoading, isAuthenticated, user, navigate]);

  return <div className="container py-4">Redirecting...</div>;
}