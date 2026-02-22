import Navbar from "../../components/Navbar";

export default function StudentDashboard() {
  return (
    <>
      <Navbar />
      <div className="container py-4 ms-3">
        <h1 className="mb-2">Student Dashboard</h1>
        <p className="text-muted">You are logged in as a student.</p>
      </div>
    </>
  );
}