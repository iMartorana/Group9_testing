import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getUserByEmail,
  getAllSkills,
  getActiveListings,
  createListing,
  addSkillToListing,
  createBookingRequest,
  createConversation,
  sendMessage,
} from "../../services/supabaseapi";

export default function JobListings() {
  const { user } = useAuth0();
  const [dbUser, setDbUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Message modal state
  const [messageModal, setMessageModal] = useState({ open: false, listing: null });
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Filters
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minPay, setMinPay] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [pricingType, setPricingType] = useState("");

  // Applied filters (only update on button press)
  const [applied, setApplied] = useState({
    skill: "", location: "", minPay: "", date: "", pricingType: ""
  });

  // Create new job listing
  const [newListing, setNewListing] = useState({
    title: "", description: "", location_text: "", pricing_type: "hourly", price_amount: "", selectedSkills: []
  });

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: userData, error: userError } = await getUserByEmail(user.email);
      if (userError) throw userError;
      setDbUser(userData);

      await fetchListings();

      const { data: skillData, error: skillError } = await getAllSkills();
      if (skillError) throw skillError;
      setSkills(skillData || []);
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
    setApplied({ skill: skillFilter, location: locationFilter, minPay, date: dateFilter, pricingType });
  };

  const handleClearFilters = () => {
    setSkillFilter(""); setLocationFilter(""); setMinPay(""); setDateFilter(""); setPricingType("");
    setApplied({ skill: "", location: "", minPay: "", date: "", pricingType: "" });
  };

  const filtered = listings.filter(listing => {
    const listingSkillNames = listing.listingsskills?.map(ls => ls.skills?.name) ?? [];
    if (applied.skill && !listingSkillNames.includes(applied.skill)) return false;
    if (applied.location && !listing.location_text?.toLowerCase().includes(applied.location.toLowerCase())) return false;
    if (applied.minPay && listing.price_amount < Number(applied.minPay)) return false;
    if (applied.date && new Date(listing.created_at) < new Date(applied.date)) return false;
    if (applied.pricingType && listing.pricing_type !== applied.pricingType) return false;
    return true;
  });

  const applyForListing = async (listing) => {
    if (!dbUser) return
    setApplying(listing.listing_id);
    try {
      const now = new Date().toISOString();
      const { error } = await createBookingRequest({
          customer_id: dbUser.user_id,
          listing_id: listing.listing_id,
          requested_start_at: now,
          requested_end_at: now,
        });
      if (error) throw error;
      alert("Application submitted!");
    } catch (err) {
      console.error("Failed to apply:", err);
      alert("Failed to submit application.");
    } finally {
      setApplying(null);
    }
  };

  // Open the message modal with a pre-filled default message
  const openMessageModal = (listing) => {
    if (!dbUser) return;
    if (!listing.users?.user_id) return alert("Cannot message: listing has no associated user.");
    const defaultMessage = `Hi, I'm interested in your job listing: "${listing.title}". Can we discuss further?`;
    setMessageText(defaultMessage);
    setMessageModal({ open: true, listing });
  };
 
  const closeMessageModal = () => {
    setMessageModal({ open: false, listing: null });
    setMessageText("");
  };
 
  // Send the (possibly edited) message
  const handleSendMessage = async () => {
    const { listing } = messageModal;
    if (!listing || !dbUser) return;
    const recipientId = listing.users?.user_id;
    if (!recipientId) return alert("Cannot message: listing has no associated user.");
 
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
        body: messageText.trim(),
      });
      if (msgError) throw msgError;
      closeMessageModal();
      alert("Message sent to the job poster!");
    } catch (err) {
      console.error("Failed to message:", err);
      alert("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateListing = async () => {
    if (!newListing.title || !newListing.price_amount) return alert("Please fill in title and price.");
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
      setNewListing({ title: "", description: "", location_text: "", pricing_type: "hourly", price_amount: "", selectedSkills: [] });
      await fetchListings();
    } catch (err) {
      console.error("Failed to create listing:", err);
      alert("Failed to create listing.");
    }
  };

  const toggleSkill = (skill_id) => {
    setNewListing(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill_id)
        ? prev.selectedSkills.filter(id => id !== skill_id)
        : [...prev.selectedSkills, skill_id]
    }));
  };

  if (loading) return <div className="container py-4">Loading listings...</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-4">Available Jobs</h2>
        <button className="btn btn-success" onClick={() => setShowCreateModal(true)}>+ Post a Job</button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filter Jobs</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Skill Required</label>
              <select className="form-select" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
                <option value="">All Skills</option>
                {skills.map(s => (<option key={s.skill_id} value={s.name}>{s.name}</option>))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <input className="form-control" placeholder="e.g. Milwaukee" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Minimum Pay ($)</label>
              <input className="form-control" type="number" placeholder="e.g. 20" value={minPay} onChange={e => setMinPay(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Posted After</label>
              <input className="form-control" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Pricing Type</label>
              <select className="form-select" value={pricingType} onChange={e => setPricingType(e.target.value)} >
                <option value="">Any</option>
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end gap-2">
              <button className="btn btn-primary w-100" onClick={handleApplyFilters}>Apply Filters</button>
              <button className="btn btn-outline-secondary w-100" onClick={handleClearFilters}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {filtered.length === 0 ? (
        <p className="text-muted">No jobs match your filters.</p>
      ) : (
        <div className="row g-3">
          {filtered.map(listing => (
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
                  <p className="text-muted mb-1">Location: {listing.location_text || "Remote"}</p>
                  <p className="text-muted mb-1">Rate: ${listing.price_amount} ({listing.pricing_type})</p>
                  <p className="text-muted mb-2">Date: {new Date(listing.created_at).toLocaleDateString()}</p>
                  <div>
                    {listing.listingsskills?.map(ls => (
                      <span key={ls.skills?.skill_id} className="badge bg-primary me-1">{ls.skills?.name}</span>
                    ))}
                  </div>
                </div>
                <div className="card-footer d-flex gap-2 flex-wrap">
                  <button
                   className="btn btn-primary btn-sm flex-fill"
                   disabled={applying === listing.listing_id}
                   onClick={() => applyForListing(listing)}
                   >
                    {applying === listing.listing_id ? "Applying..." : "Apply"}
                   </button>
                   <button
                    className="btn btn-outline-secondary btn-sm flex-fill"
                    onClick={() => openMessageModal(listing)}
                   >
                    Message
                     </button>
                     <button
                     className="btn btn-outline-primary btn-sm flex-fill"
                     onClick={() =>
                      window.location.href = `/reviews?studentEmail=${encodeURIComponent(listing.users?.email || "")}`
                    }
                    
                    disabled={!listing.users?.email}
                    >
                       Reviews
                    </button>
                     </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {messageModal.open && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Message Poster
                  {messageModal.listing && (
                    <span className="text-muted fw-normal fs-6 ms-2">
                      — {messageModal.listing.users?.first_name} {messageModal.listing.users?.last_name}
                    </span>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={closeMessageModal} />
              </div>
              <div className="modal-body">
                <label className="form-label">
                  Your message
                  <span className="text-muted fw-normal ms-1 small">(edit before sending)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Write your message here..."
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeMessageModal} disabled={sendingMessage}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                >
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Post a New Job</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Title *</label>
                    <input
                      className="form-control"
                      placeholder="e.g. React Developer Needed"
                      value={newListing.title}
                      onChange={e => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe the job..."
                      value={newListing.description}
                      onChange={e => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Milwaukee, WI or Remote"
                      value={newListing.location_text}
                      onChange={e => setNewListing(prev => ({ ...prev, location_text: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Pricing Type *</label>
                    <select
                      className="form-select"
                      value={newListing.pricing_type}
                      onChange={e => setNewListing(prev => ({ ...prev, pricing_type: e.target.value }))}
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
                      onChange={e => setNewListing(prev => ({ ...prev, price_amount: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Skills Required</label>
                    <div className="d-flex flex-wrap gap-2">
                      {skills.map(s => (
                        <div key={s.skill_id}>
                          <input
                            type="checkbox"
                            className="btn-check"
                            id={`skill-${s.skill_id}`}
                            checked={newListing.selectedSkills.includes(s.skill_id)}
                            onChange={() => toggleSkill(s.skill_id)}
                          />
                          <label
                            className={`btn btn-sm ${newListing.selectedSkills.includes(s.skill_id) ? "btn-primary" : "btn-outline-primary"}`}
                            htmlFor={`skill-${s.skill_id}`}
                          >
                            {s.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleCreateListing}>Post Job</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}