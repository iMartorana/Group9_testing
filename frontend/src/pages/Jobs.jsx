import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";
import {
  getUserByEmail,
  getAllSkills,
  getSkillsForStudent,
  getActiveListings,
  createListing,
  addSkillToListing,
  createBookingRequest,
  createConversation,
  sendMessage,
} from "../services/supabaseapi";

export default function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [dbUser, setDbUser] = useState(null);
  const [role, setRole] = useState(null);
  const [listings, setListings] = useState([]);
  const [skills, setSkills] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [hireModal, setHireModal] = useState(null);
  const [hireForm, setHireForm] = useState({ price: "", startDate: "", endDate: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messageModal, setMessageModal] = useState(null);
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [maxPay, setMaxPay] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [pricingType, setPricingType] = useState("");
  const [applied, setApplied] = useState({
    skill: "",
    location: "",
    maxPay: "",
    date: "",
    pricingType: "",
  });

  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    location_text: "",
    pricing_type: "hourly",
    price_amount: "",
    selectedSkills: [],
  });

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: userData, error: userError } = await getUserByEmail(user.email);
      if (userError) throw userError;
      setDbUser(userData);
      setRole(userData.role);

      await fetchListings();

      const { data: skillData, error: skillError } = await getAllSkills();
      if (skillError) throw skillError;
      setSkills(skillData || []);

      if (userData.role === "student") {
        const { data: studentSkillData, error: studentSkillError } =
          await getSkillsForStudent(userData.user_id);

        if (!studentSkillError && studentSkillData) {
          const profileSkills = studentSkillData.map((row) => row.skills).filter(Boolean);
          setStudentSkills(profileSkills);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    const { data, error } = await getActiveListings();
    if (error) throw error;
    setListings(data || []);
  };

  const handleApplyFilters = () => {
    setApplied({
      skill: skillFilter,
      location: locationFilter,
      maxPay,
      date: dateFilter,
      pricingType,
    });
  };

  const handleClearFilters = () => {
    setSkillFilter("");
    setLocationFilter("");
    setMaxPay("");
    setDateFilter("");
    setPricingType("");
    setApplied({
      skill: "",
      location: "",
      maxPay: "",
      date: "",
      pricingType: "",
    });
  };

  const filtered = listings.filter((listing) => {
    if (role === "student" && dbUser && listing.student_id === dbUser.user_id) return false;

    const listingSkillNames = listing.listingsskills?.map((ls) => ls.skills?.name) ?? [];
    if (applied.skill && !listingSkillNames.includes(applied.skill)) return false;
    if (
      applied.location &&
      !listing.location_text?.toLowerCase().includes(applied.location.toLowerCase())
    ) {
      return false;
    }
    if (applied.maxPay && listing.price_amount > Number(applied.maxPay)) return false;
    if (applied.date && new Date(listing.created_at) < new Date(applied.date)) return false;
    if (applied.pricingType && listing.pricing_type !== applied.pricingType) return false;

    return true;
  });

  const openHireModal = (listing) => {
    setHireModal(listing);
    setHireForm({
      price: listing.price_amount ?? "",
      startDate: "",
      endDate: "",
    });
  };

  const sendHireRequest = async () => {
    if (!dbUser || !hireModal) return;
    if (!hireForm.startDate || !hireForm.endDate) {
      alert("Please set a start and end date.");
      return;
    }
    if (new Date(hireForm.endDate) < new Date(hireForm.startDate)) {
      alert("End date must be after start date.");
      return;
    }

    setHiring(true);
    try {
      const { error } = await createBookingRequest({
        customer_id: dbUser.user_id,
        listing_id: hireModal.listing_id,
        requested_start_at: new Date(hireForm.startDate).toISOString(),
        requested_end_at: new Date(hireForm.endDate).toISOString(),
        note: JSON.stringify({ agreed_price: Number(hireForm.price) }),
      });

      if (error) throw error;
      alert("Hire request sent!");
      setHireModal(null);
    } catch (err) {
      console.error("Failed to hire:", err);
      alert("Failed to send hire request.");
    } finally {
      setHiring(false);
    }
  };

  const openMessageModal = (listing) => {
    setMessageModal(listing);
    setMessageBody(`Hi, I'm interested in your listing: "${listing.title}". Can we discuss further?`);
  };

  const sendMessageToListing = async () => {
    if (!dbUser || !messageModal) return;

    const recipientId = messageModal.users?.user_id;
    if (!recipientId) {
      alert("Cannot message: listing has no associated user.");
      return;
    }

    setSendingMessage(true);
    try {
      const { data: convo, error: convoError } = await createConversation({
        initiatorUserId: dbUser.user_id,
        recipientUserId: recipientId,
      });
      if (convoError) throw convoError;

      const { error: msgError } = await sendMessage({
        conversationId: convo.conversation_id,
        senderUserId: dbUser.user_id,
        body: messageBody.trim(),
      });
      if (msgError) throw msgError;

      alert("Message sent!");
      setMessageModal(null);
      setMessageBody("");
    } catch (err) {
      console.error("Failed to message:", err);
      alert("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateListing = async () => {
    if (!newListing.title || !newListing.price_amount) {
      alert("Please fill in title and price.");
      return;
    }

    try {
      const { data: created, error: listingError } = await createListing({
        student_id: dbUser.user_id,
        title: newListing.title,
        description: newListing.description || null,
        location_text: newListing.location_text || null,
        pricing_type: newListing.pricing_type,
        price_amount: Number(newListing.price_amount),
      });
      if (listingError) throw listingError;

      for (const skill_id of newListing.selectedSkills) {
        await addSkillToListing(created.listing_id, skill_id);
      }

      alert("Listing created!");
      setShowCreateModal(false);
      setNewListing({
        title: "",
        description: "",
        location_text: "",
        pricing_type: "hourly",
        price_amount: "",
        selectedSkills: [],
      });
      await fetchListings();
    } catch (err) {
      console.error("Failed to create listing:", err);
      alert("Failed to create listing.");
    }
  };

  const toggleSkill = (skill_id) => {
    setNewListing((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill_id)
        ? prev.selectedSkills.filter((id) => id !== skill_id)
        : [...prev.selectedSkills, skill_id],
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-4">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Available Jobs</h2>
          {role === "student" && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              + Post a Job
            </button>
          )}
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Filter Jobs</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Skill</label>
                <select
                  className="form-select"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                >
                  <option value="">All Skills</option>
                  {skills.map((s) => (
                    <option key={s.skill_id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Location</label>
                <input
                  className="form-control"
                  placeholder="e.g. Milwaukee, WI"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Maximum Pay ($)</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="e.g. 50"
                  value={maxPay}
                  onChange={(e) => setMaxPay(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Posted After</label>
                <input
                  className="form-control"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Pricing Type</label>
                <select
                  className="form-select"
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              <div className="col-md-4 d-flex align-items-end gap-2">
                <button className="btn btn-primary w-100" onClick={handleApplyFilters}>
                  Apply Filters
                </button>
                <button className="btn btn-outline-secondary w-100" onClick={handleClearFilters}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted">No jobs match your filters.</p>
        ) : (
          <div className="row g-3">
            {filtered.map((listing) => (
              <div className="col-md-6" key={listing.listing_id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-header">
                    <h5 className="card-title mb-0">{listing.title}</h5>
                  </div>

                  <div className="card-body">
                    <p className="text-muted small mb-1">
                      Posted by {listing.users?.first_name} {listing.users?.last_name}
                    </p>

                    {listing.description && <p className="small mb-2">{listing.description}</p>}

                    <p className="text-muted mb-1">
                      Location: {listing.location_text || "Remote"}
                    </p>

                    <p className="text-muted mb-1">
                      Rate: ${listing.price_amount} ({listing.pricing_type})
                    </p>

                    <p className="text-muted mb-2">
                      Date: {new Date(listing.created_at).toLocaleDateString()}
                    </p>

                    <div>
                      {listing.listingsskills?.map((ls) => (
                        <span key={ls.skills?.skill_id} className="badge bg-primary me-1">
                          {ls.skills?.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card-footer d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-primary btn-sm flex-fill"
                      onClick={() => openHireModal(listing)}
                    >
                      Hire
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm flex-fill"
                      onClick={() => openMessageModal(listing)}
                    >
                      Message
                    </button>

                    <button
                      className="btn btn-outline-primary btn-sm flex-fill"
                      onClick={() => navigate(`/reviews?studentId=${listing.student_id}`)}
                    >
                      Reviews
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Post a New Job</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Title *</label>
                      <input
                        className="form-control"
                        placeholder="e.g. Pet Sitter Available for Weekend Gigs"
                        value={newListing.title}
                        onChange={(e) =>
                          setNewListing((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Describe what you can do..."
                        value={newListing.description}
                        onChange={(e) =>
                          setNewListing((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <span
                          title="Use precise city name with state initials, Eg: 'Oak Creek, WI' not 'Milwaukee'."
                          style={{ cursor: "help" }}
                        >
                           *
                        </span>
                      <input
                        className="form-control"
                        placeholder="e.g. Milwaukee, WI or Remote"
                        value={newListing.location_text}
                        onChange={(e) =>
                          setNewListing((prev) => ({
                            ...prev,
                            location_text: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Pricing Type *</label>
                      <select
                        className="form-select"
                        value={newListing.pricing_type}
                        onChange={(e) =>
                          setNewListing((prev) => ({
                            ...prev,
                            pricing_type: e.target.value,
                          }))
                        }
                      >
                        <option value="hourly">Hourly</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Price ($) *</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="e.g. 25"
                        value={newListing.price_amount}
                        onChange={(e) =>
                          setNewListing((prev) => ({
                            ...prev,
                            price_amount: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Your Skills</label>
                      {studentSkills.length === 0 ? (
                        <p className="text-muted small mb-0">
                          You haven't added any skills to your profile yet.{" "}
                          <a href="/profile">Go to your profile</a> to add skills first.
                        </p>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {studentSkills.map((s) => (
                            <div key={s.skill_id}>
                              <input
                                type="checkbox"
                                className="btn-check"
                                id={`skill-${s.skill_id}`}
                                checked={newListing.selectedSkills.includes(s.skill_id)}
                                onChange={() => toggleSkill(s.skill_id)}
                              />
                              <label
                                className={`btn btn-sm ${
                                  newListing.selectedSkills.includes(s.skill_id)
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                htmlFor={`skill-${s.skill_id}`}
                              >
                                {s.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleCreateListing}>
                    Post Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {messageModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Message {messageModal.users?.first_name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessageModal(null)}
                  />
                </div>

                <div className="modal-body">
                  <p className="text-muted small mb-2">
                    Re: <strong>{messageModal.title}</strong>
                  </p>
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setMessageModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!messageBody.trim() || sendingMessage}
                    onClick={sendMessageToListing}
                  >
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {hireModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Hire — {hireModal.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setHireModal(null)}
                  />
                </div>

                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Posted by {hireModal.users?.first_name} {hireModal.users?.last_name} · Listed
                    at ${hireModal.price_amount} ({hireModal.pricing_type})
                  </p>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Agreed Price ($) *</label>
                      <input
                        className="form-control"
                        type="number"
                        min="0"
                        value={hireForm.price}
                        onChange={(e) =>
                          setHireForm((prev) => ({ ...prev, price: e.target.value }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Start Date *</label>
                      <input
                        className="form-control"
                        type="date"
                        value={hireForm.startDate}
                        onChange={(e) =>
                          setHireForm((prev) => ({ ...prev, startDate: e.target.value }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">End Date *</label>
                      <input
                        className="form-control"
                        type="date"
                        value={hireForm.endDate}
                        min={hireForm.startDate || undefined}
                        onChange={(e) =>
                          setHireForm((prev) => ({ ...prev, endDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setHireModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!hireForm.price || !hireForm.startDate || !hireForm.endDate || hiring}
                    onClick={sendHireRequest}
                  >
                    {hiring ? "Sending..." : "Send Hire Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}