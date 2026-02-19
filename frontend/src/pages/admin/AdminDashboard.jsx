import Navbar from "../../components/Navbar.jsx";

export default function AdminDashboard() {
  return (
    <>
      <Navbar />

      <div className="container py-4">
        <h1 className="display-5 text-danger fw-bold">
          ADMIN DASHBOARD
        </h1>

        <p className="lead">
          You are logged in as an admin.
        </p>
      </div>
    </>
  );
}
