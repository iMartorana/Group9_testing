import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../../components/Navbar.jsx";
import {
  getAllUsers,
  getActiveListings,
  hardDeleteListing,
} from "../../services/supabaseapi.jsx";

export default function AdminDashboard() {
  const { user } = useAuth0();

  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [userFilter, setUserFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Sorting state
  const [userSort, setUserSort] = useState({ key: "user_id", dir: "asc" });
  const [listingSort, setListingSort] = useState({ key: "listing_id", dir: "asc" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: userData, error: userErr },
        { data: listingData, error: listingErr },
      ] = await Promise.all([getAllUsers(), getActiveListings()]);

      if (userErr) throw userErr;
      if (listingErr) throw listingErr;

      setUsers(userData || []);
      setListings(listingData || []);
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reverse of createListing + addSkillToListing:
  // hardDeleteListing removes listingsskills rows first, then the listing itself.
  const handleDeleteListing = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await hardDeleteListing(deleteTarget.listing_id);
      if (error) throw error;

      // Remove from local state so the table updates immediately
      setListings((prev) =>
        prev.filter((l) => l.listing_id !== deleteTarget.listing_id)
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setDeleteError(err.message || "Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  };

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  // Sorting helpers
  const toggleSort = (current, setCurrent, key) => {
    setCurrent((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  };

  const SortArrow = ({ active, dir }) => {
    if (!active) return <span className="text-muted ms-1">↕</span>;
    return <span className="ms-1">{dir === "asc" ? "▲" : "▼"}</span>;
  };

  const compareValues = (a, b, dir = "asc") => {
    const av = a ?? "";
    const bv = b ?? "";

    // numbers
    if (typeof av === "number" && typeof bv === "number") {
      return dir === "asc" ? av - bv : bv - av;
    }

    // dates
    const aDate = av instanceof Date ? av.getTime() : null;
    const bDate = bv instanceof Date ? bv.getTime() : null;
    if (aDate !== null && bDate !== null) {
      return dir === "asc" ? aDate - bDate : bDate - aDate;
    }

    // strings
    const as = String(av).toLowerCase();
    const bs = String(bv).toLowerCase();
    if (as < bs) return dir === "asc" ? -1 : 1;
    if (as > bs) return dir === "asc" ? 1 : -1;
    return 0;
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const matchName = !userFilter || fullName.includes(userFilter.toLowerCase());
      const matchRole = !roleFilter || u.role === roleFilter;
      return matchName && matchRole;
    });
  }, [users, userFilter, roleFilter]);

  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];

    copy.sort((a, b) => {
      let av, bv;

      switch (userSort.key) {
        case "name":
          av = `${a.first_name} ${a.last_name}`;
          bv = `${b.first_name} ${b.last_name}`;
          break;
        case "role":
          av = a.role;
          bv = b.role;
          break;
        case "user_id":
        default:
          av = a.user_id;
          bv = b.user_id;
          break;
      }

      return compareValues(av, bv, userSort.dir);
    });

    return copy;
  }, [filteredUsers, userSort]);

  const sortedListings = useMemo(() => {
    const copy = [...listings];

    copy.sort((a, b) => {
      let av, bv;

      switch (listingSort.key) {
        case "title":
          av = a.title;
          bv = b.title;
          break;
        case "posted_by":
          av = `${a.users?.first_name || ""} ${a.users?.last_name || ""}`;
          bv = `${b.users?.first_name || ""} ${b.users?.last_name || ""}`;
          break;
        case "rate":
          av = a.price_amount;
          bv = b.price_amount;
          break;
        case "location":
          av = a.location_text || "Remote";
          bv = b.location_text || "Remote";
          break;
        case "created":
          av = new Date(a.created_at);
          bv = new Date(b.created_at);
          break;
        case "listing_id":
        default:
          av = a.listing_id;
          bv = b.listing_id;
          break;
      }

      return compareValues(av, bv, listingSort.dir);
    });

    return copy;
  }, [listings, listingSort]);

  return (
    <>
      <Navbar />

      <div className="container py-4">
        <h1 className="display-5 text-danger fw-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted mb-4">Manage users and job listings.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Users", value: users.length, color: "primary" },
            { label: "Students", value: roleCounts.student || 0, color: "success" },
            { label: "Clients", value: roleCounts.client || 0, color: "info" },
            { label: "Active Listings", value: listings.length, color: "warning" },
          ].map(({ label, value, color }) => (
            <div className="col-6 col-md-3" key={label}>
              <div className={`card border-${color} text-center h-100`}>
                <div className="card-body">
                  <p className="text-muted small mb-1">{label}</p>
                  <h2 className={`fw-bold text-${color} mb-0`}>
                    {loading ? "…" : value}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="mb-0">All Users</h5>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name…"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                style={{ width: 180 }}
              />
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: 120 }}
              >
                <option value="">All roles</option>
                <option value="student">Student</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <p className="text-muted p-3 mb-0">Loading…</p>
            ) : sortedUsers.length === 0 ? (
              <p className="text-muted p-3 mb-0">No users match your filters.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort(userSort, setUserSort, "user_id")}
                      >
                        #
                        <SortArrow
                          active={userSort.key === "user_id"}
                          dir={userSort.dir}
                        />
                      </th>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort(userSort, setUserSort, "name")}
                      >
                        Name
                        <SortArrow
                          active={userSort.key === "name"}
                          dir={userSort.dir}
                        />
                      </th>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort(userSort, setUserSort, "role")}
                      >
                        Role
                        <SortArrow
                          active={userSort.key === "role"}
                          dir={userSort.dir}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((u) => (
                      <tr key={u.user_id}>
                        <td className="text-muted small">{u.user_id}</td>
                        <td>
                          {u.first_name} {u.last_name}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              u.role === "admin"
                                ? "bg-danger"
                                : u.role === "student"
                                ? "bg-success"
                                : "bg-info text-dark"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Active listings table */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Active Job Listings</h5>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <p className="text-muted p-3 mb-0">Loading…</p>
            ) : sortedListings.length === 0 ? (
              <p className="text-muted p-3 mb-0">No active listings.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          toggleSort(listingSort, setListingSort, "listing_id")
                        }
                      >
                        #
                        <SortArrow
                          active={listingSort.key === "listing_id"}
                          dir={listingSort.dir}
                        />
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort(listingSort, setListingSort, "title")}
                      >
                        Title
                        <SortArrow
                          active={listingSort.key === "title"}
                          dir={listingSort.dir}
                        />
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          toggleSort(listingSort, setListingSort, "posted_by")
                        }
                      >
                        Posted by
                        <SortArrow
                          active={listingSort.key === "posted_by"}
                          dir={listingSort.dir}
                        />
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSort(listingSort, setListingSort, "rate")}
                      >
                        Rate
                        <SortArrow
                          active={listingSort.key === "rate"}
                          dir={listingSort.dir}
                        />
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          toggleSort(listingSort, setListingSort, "location")
                        }
                      >
                        Location
                        <SortArrow
                          active={listingSort.key === "location"}
                          dir={listingSort.dir}
                        />
                      </th>

                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          toggleSort(listingSort, setListingSort, "created")
                        }
                      >
                        Created
                        <SortArrow
                          active={listingSort.key === "created"}
                          dir={listingSort.dir}
                        />
                      </th>

                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedListings.map((l) => (
                      <tr key={l.listing_id}>
                        <td className="text-muted small">{l.listing_id}</td>
                        <td>{l.title}</td>
                        <td>
                          {l.users?.first_name} {l.users?.last_name}
                        </td>
                        <td>
                          ${l.price_amount}{" "}
                          <span className="text-muted small">
                            / {l.pricing_type}
                          </span>
                        </td>
                        <td>
                          {l.location_text || (
                            <span className="text-muted">Remote</span>
                          )}
                        </td>
                        <td className="text-muted small">
                          {new Date(l.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(l)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Permanently Delete Listing</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteError(null);
                  }}
                />
              </div>
              <div className="modal-body">
                {deleteError && (
                  <div className="alert alert-danger py-2">{deleteError}</div>
                )}
                <p>
                  Are you sure you want to permanently delete{" "}
                  <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>? Posted by{" "}
                  {deleteTarget.users?.first_name} {deleteTarget.users?.last_name}.
                </p>
                <p className="text-muted small mb-0">
                  This will remove the listing and all its skill tags from the
                  database.{" "}
                  <strong className="text-danger">This cannot be undone.</strong>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteListing}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}