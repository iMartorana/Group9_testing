import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Login from "./pages/login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import PostLoginRedirect from "./pages/PostLoginRedirect";
import Navbar from "./components/Navbar";   
import Profile from "./pages/Profile";

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return <div className="container py-4">Loading...</div>;
  return isAuthenticated? children : <Navigate to="/" replace />;
}

export default function App() {
  const { error, isAuthenticated } = useAuth0();

  return (
    <>
      {error && (
        <div className="container py-3">
          <div className="alert alert-danger">{error.message}</div>
        </div>
      )}
      

    <Routes>
      <Route
        path="/"
        element={isAuthenticated? <Navigate to="/post-login" replace /> : <Login />}
      />

      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />

      <Route
        path="/post-login"
        element={
          <RequireAuth>
            <PostLoginRedirect />
          </RequireAuth>
        }
      />
        <Route
          path="/student/dashboard"
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/client/dashboard"
          element={
            <RequireAuth>
              <ClientDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* Catch-all MUST be last */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/post-login" replace /> : <Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}
