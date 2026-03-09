import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function StudentDashboard() {
  const { user } = useAuth0();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    const saved = localStorage.getItem(`profile_${user.email.toLowerCase()}`);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(JSON.parse(saved));
    }
  }, [user]);

  return (
    <>
      <Navbar />

      <div className="container py-4">
        <div className="p-4 p-md-5 mb-4 rounded-4 bg-light border shadow-sm">
          <div className="row align-items-center g-4">
            <div className="col-md-8">
              <h1 className="display-6 fw-bold mb-2">
                Welcome back, {profile?.name || user?.given_name || user?.name || "Student"}
              </h1>
              <p className="text-muted mb-0">
                Manage your profile, explore job opportunities, track reviews, and stay ready for new client connections.
              </p>
            </div>

          
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">Browse Jobs</h5>
                <p className="card-text text-muted">
                  Explore opportunities that match your skills and schedule.
                </p>
                <Link to="/jobs" className="btn btn-sm btn-primary">
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">Messages</h5>
                <p className="card-text text-muted">
                  View your previous conversations and start new ones.
                </p>
                <Link to="/messages" className="btn btn-sm btn-primary">
                  View Messages
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">Payments</h5>
                <p className="card-text text-muted">
                  Stay updated on your payment activity and history.
                </p>
                <Link to="/payment" className="btn btn-sm btn-primary">
                  Open Payments
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">Reviews</h5>
                <p className="card-text text-muted">
                  Check your ratings and see what clients think about your work.
                </p>
                <Link to="/reviews" className="btn btn-sm btn-primary">
                  View Reviews
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h4 className="mb-3">Profile Snapshot</h4>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 rounded bg-light border h-100">
                      <h6 className="fw-bold mb-2">Bio</h6>
                      <p className="text-muted mb-0">
                        {profile?.bio?.trim() || "No bio added yet. Update your profile to tell clients more about yourself."}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 rounded bg-light border h-100">
                      <h6 className="fw-bold mb-2">Contact</h6>
                      <p className="text-muted mb-1">
                        <strong>Email:</strong> {profile?.email || user?.email || "Not available"}
                      </p>
                      <p className="text-muted mb-0">
                        <strong>Phone:</strong> {profile?.phone || "Not added yet"}
                      </p>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="p-3 rounded bg-light border">
                      <h6 className="fw-bold mb-2">Profile Completion</h6>
                      <p className="text-muted mb-0">
                        {profile?.bio && profile?.phone
                          ? "Your profile looks strong and ready for clients."
                          : "Complete your bio and phone number to make your profile stronger."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Link to="/profile" className="btn btn-outline-primary">
                    Update Profile
                  </Link>
                  <Link to="/jobs" className="btn btn-outline-primary">
                    Browse Opportunities
                  </Link>
                  <Link to="/reviews" className="btn btn-outline-primary">
                    Check Reviews
                  </Link>
                  <Link to="/payment" className="btn btn-outline-primary">
                    View Payments
                  </Link>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="mb-3">Recent Activity</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 text-muted">No recent messages yet.</li>
                  <li className="list-group-item px-0 text-muted">No recent reviews yet.</li>
                  <li className="list-group-item px-0 text-muted">No recent payments yet.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}