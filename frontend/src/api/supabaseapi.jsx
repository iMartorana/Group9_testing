import supabase from "../../../supabaseconfig.js";

/*
 * supabaseapi.jsx
 * Wrapper functions for all Supabase database operations.
 * Import the function you need rather than importing supabase directly in pages.
 */

// ─── USERS ───────────────────────────────────────────────────────────────────

/**
 * Fetch a single user row by email.
 * Returns { data: user | null, error }
 */
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();
  return { data, error };
}

/**
 * Insert or update a user. Matches on email (unique).
 * Pass at minimum { email, role }.
 * Returns { data: user, error }
 */
export async function upsertUser(userFields) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      { ...userFields, email: userFields.email.toLowerCase(), updated_at: new Date().toISOString() },
      { onConflict: "email" }
    )
    .select()
    .single();
  return { data, error };
}

/**
 * Update profile fields for an existing user by email.
 * Pass any subset of { first_name, last_name, phone, bio }.
 * Returns { data: user, error }
 */
export async function updateUserProfile(email, fields) {
  const { data, error } = await supabase
    .from("users")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("email", email.toLowerCase())
    .select()
    .single();
  return { data, error };
}

// ─── SKILLS ──────────────────────────────────────────────────────────────────

/**
 * Get all active skills.
 * Returns { data: skill[], error }
 */
export async function getAllSkills() {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return { data, error };
}

/**
 * Get skills belonging to a specific student (by user_id).
 * Returns { data: studentSkill[], error }
 */
export async function getStudentSkills(studentId) {
  const { data, error } = await supabase
    .from("student_skills")
    .select("*, skills(name)")
    .eq("student_id", studentId);
  return { data, error };
}

// ─── LISTINGS ─────────────────────────────────────────────────────────────────

/**
 * Fetch listings with optional filters.
 * filters: { status, student_id, pricing_type }
 * Returns { data: listing[], error }
 */
export async function getListings(filters = {}) {
  let query = supabase
    .from("listings")
    .select("*, users(first_name, last_name, email)")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.student_id) query = query.eq("student_id", filters.student_id);
  if (filters.pricing_type) query = query.eq("pricing_type", filters.pricing_type);

  const { data, error } = await query;
  return { data, error };
}

/**
 * Create a new listing.
 * Pass { student_id, title, description, status, location_text, pricing_type, price_amount }
 * Returns { data: listing, error }
 */
export async function createListing(listingFields) {
  const { data, error } = await supabase
    .from("listings")
    .insert(listingFields)
    .select()
    .single();
  return { data, error };
}

// ─── BOOKING REQUESTS ─────────────────────────────────────────────────────────

/**
 * Create a booking request.
 * Pass { listing_id, client_id, student_id, message, proposed_time }
 * Returns { data: bookingRequest, error }
 */
export async function createBookingRequest(fields) {
  const { data, error } = await supabase
    .from("booking_requests")
    .insert(fields)
    .select()
    .single();
  return { data, error };
}

/**
 * Get all booking requests for a student.
 * Returns { data: bookingRequest[], error }
 */
export async function getStudentBookings(studentId) {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*, listings(title), users!client_id(first_name, last_name, email)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return { data, error };
}

/**
 * Get all booking requests made by a client.
 * Returns { data: bookingRequest[], error }
 */
export async function getClientBookings(clientId) {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*, listings(title), users!student_id(first_name, last_name, email)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

/**
 * Get unread notifications for a user.
 * Returns { data: notification[], error }
 */
export async function getUnreadNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });
  return { data, error };
}

/**
 * Mark a notification as read.
 * Returns { data: notification, error }
 */
export async function markNotificationRead(notificationId) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", notificationId)
    .select()
    .single();
  return { data, error };
}