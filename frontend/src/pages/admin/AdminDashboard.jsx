import Navbar from "../../components/Navbar.jsx";
import GetStartedCard from "../../components/GetStartedCard.jsx";

export default function AdminDashboard() {
  return (
    <>
      <Navbar/>
      
      <GetStartedCard/>

      <div className="container py-4 ms-3">
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
