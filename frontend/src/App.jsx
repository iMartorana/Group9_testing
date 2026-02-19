import { useAuth0 } from "@auth0/auth0-react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard"; 

export default function App() {
  const { isLoading, isAuthenticated, error } = useAuth0();

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {error && (
        <div className="container py-3">
          <div className="alert alert-danger">{error.message}</div>
        </div>
      )}

      {!isAuthenticated ? <Login /> : <AdminDashboard />}
    </>
  );
}
