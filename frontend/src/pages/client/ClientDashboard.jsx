import Navbar from "../../components/Navbar";

export default function ClientDashboard() {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="mb-2">Client Dashboard</h1>
        <p className="text-muted">You are logged in as a client/customer.</p>
      </div>
    </>
  );
}