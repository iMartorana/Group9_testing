import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { supabase } from "../../supabaseconfig";
import {
  getUserByEmail,
  getAllSkills,
  createBookingRequest,
  createConversation,
  sendMessage,
} from "../../services/supabaseapi";

export default function SkillListings() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [dbUser, setDbUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Draft filters
  const [skillFilter, setSkillFilter] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  // Applied filters (only update on button press)
  const [applied, setApplied] = useState({
    skill: "", maxSalary: "", location: "", availability: ""
  });

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: userData, error: userError } = await getUserByEmail(user.email);
      if (userError) throw userError;
      setDbUser(userData);

      // Only show students with at least one active listing
      const { data: studentData, error: studentError } = await supabase
        .from("users")
        .select(`
          user_id, first_name, last_name, bio,
          studentskills ( proficiency, skills ( skill_id, name ) ),
          listings ( listing_id, title, price_amount, pricing_type, location_text, status ),
          availabilityslots ( slot_id, start_at, end_at, status )
        `)
        .eq("role", "student");
      if (studentError) throw studentError;
      setStudents((studentData || []).filter(s => s.listings?.some(l => l.status === "active")));

      // Fetch all active skills for filter dropdown
      const { data: skillData, error: skillError } = await getAllSkills();
      if (skillError) throw skillError;
      setSkills(skillData || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setApplied({ skill: skillFilter, maxSalary, location: locationFilter, availability: availabilityFilter, });
  };

  const handleClearFilters = () => {
    setSkillFilter(""); setMaxSalary(""); setLocationFilter(""); setAvailabilityFilter("");
    setApplied({ skill: "", maxSalary: "", location: "", availability: "" });
  };

  const getStudentSkills = (student) => student.studentskills?.map(ss => ss.skills).filter(Boolean) ?? [];

  const getMinPrice = (student) => {
    const prices = student.listings?.filter(l => l.status === "active").map(l => l.price_amount) ?? [];
    return prices.length ? Math.min(...prices) : null;
  };

  const getAvailableDays = (student) => {
    const slots = student.availabilityslots?.filter(s => s.status === "available") ?? [];
    if (!slots.length) return "Not listed";
    const days = slots.map(s => new Date(s.start_at).toLocaleDateString("en-US", { weekday: "long" }));
    return [...new Set(days)].slice(0, 3).join(", ");
  };

  const filtered = students.filter(student => {
    const skillNames = getStudentSkills(student).map(s => s.name);
    const minPrice = getMinPrice(student);
    if (applied.skill && !skillNames.includes(applied.skill)) return false;
    if (applied.maxSalary && minPrice !== null && minPrice > Number(applied.maxSalary)) return false;
    if (applied.location) {
      const hasLocation = student.listings?.some(l =>
        l.location_text?.toLowerCase().includes(applied.location.toLowerCase())
      );
      if (!hasLocation) return false;
    }
    if (applied.availability) {
      if (!student.availabilityslots?.some(s => s.status === applied.availability)) return false;
    }
    return true;
  });

  const messageStudent = async (student) => {
    if (!dbUser) return;
    try {
      const { data: convo, error: convoError } = await createConversation({
        initiatorUserId: dbUser.user_id,
        recipientUserId: student.user_id,
      });
      if (convoError) throw convoError;
      const { error: msgError } = await sendMessage({
        conversationId: convo.conversation_id,
        senderUserId: dbUser.user_id,
        body: `Hi ${student.first_name}, I'm interested in hiring you for a job. Can we discuss your availability?`,
      });
      if (msgError) throw msgError;
      alert(`Message sent to ${student.first_name}!`);
    } catch (err) {
      console.error("Failed to message:", err);
      alert("Failed to send message.");
    }
  };

  const requestBooking = async (student) => {
    if (!dbUser) return;
    const activeListing = student.listings?.find(l => l.status === "active");
    if (!activeListing) return alert("No active listings for this student.");
    try {
      const now = new Date().toISOString();
      const { error } = await createBookingRequest({
        customer_id: dbUser.user_id,
        listing_id: activeListing.listing_id,
        requested_start_at: now,
        requested_end_at: now,
      });
      if (error) throw error;
      alert(`Booking request sent to ${student.first_name}!`);
    } catch (err) {
      console.error("Failed to request booking:", err);
      alert("Failed to send booking request.");
    }
  };

  if (loading) return <div className="container py-4">Loading students...</div>;

  return (
    <>
      <h2 className="mb-4">Browse Student Talent</h2>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filter Students</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Skill Type</label>
              <select className="form-select" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
                <option value="">All Skills</option>
                {skills.map(s => (<option key={s.skill_id} value={s.name}>{s.name}</option>))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Max Rate ($/hr)</label>
              <input className="form-control" type="number" placeholder="e.g. 25" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Location</label>
              <input className="form-control" placeholder="e.g. Milwaukee" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Availability</label>
              <select className="form-select" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
                <option value="">Any</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" onClick={handleApplyFilters}>Apply Filters</button>
              <button className="btn btn-outline-secondary" onClick={handleClearFilters}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Cards */}
      {filtered.length === 0 ? (
        <p className="text-muted">No students match your filters.</p>
      ) : (
        <div className="row g-3">
          {filtered.map(student => {
            const studentSkills = getStudentSkills(student);
            const minPrice = getMinPrice(student);
            const availability = getAvailableDays(student);
            const activeListings = student.listings?.filter(l => l.status === "active") ?? [];

            return (
              <div className="col-md-6" key={student.user_id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-header">
                    <h5 className="card-title mb-0">{student.first_name} {student.last_name}</h5>
                  </div>
                  <div className="card-body">
                    {student.bio && <p className="small text-muted mb-2">{student.bio}</p>}
                    {minPrice !== null && <p className="text-muted mb-1">Desired Salary: ${minPrice}/hr</p>}
                    <p className="text-muted mb-1">Availability: {availability}</p>
                    <p className="text-muted mb-2">
                      Active Listings: {activeListings.length} active listing{activeListings.length !== 1 ? "s" : ""}
                    </p>
                    <div>
                      {studentSkills.map(s => (
                        <span key={s.skill_id} className="badge bg-success me-1 mb-1">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer d-flex gap-2 flex-wrap">
  <button
    className="btn btn-success btn-sm flex-fill"
    onClick={() => requestBooking(student)}
  >
    Hire
  </button>

  <button
    className="btn btn-outline-primary btn-sm flex-fill"
    onClick={() => messageStudent(student)}
  >
    Message
  </button>

  <button
    className="btn btn-outline-secondary btn-sm flex-fill"
    onClick={() => navigate(`/reviews?studentId=${student.user_id}`)}
  >
    Reviews
  </button>
</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}