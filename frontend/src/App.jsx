import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Profile from "./pages/Profile";

export default function App() {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <>
          {/* Navbar ALWAYS visible when logged in */}
          <Navbar />

          {/* Page content changes below */}
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </>
      )}
    </BrowserRouter>
  );
}