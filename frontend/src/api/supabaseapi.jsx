import { supabase } from "../supabaseconfig";
/*
File to contain wrapper functions that can call supabase functions. 
Supabase configured in supabaseconfig.js
Supabase installed on system using scoop in command line
Supabase commands to retrieve and set up database. Connection should be made already,
so these are for set up. Need docker desktop running
supabase start
supabase migration up
supabase push
supabase pull
Dependencies:
supabase
supabase-js
*/

/*
  supabaseapi.jsx
  ---------------
  Centralised wrapper functions for all Supabase calls.
  Import individual functions wherever you need them:

    import { getUserByEmail, upsertUser } from "../api/supabaseapi";

  Every function returns the raw { data, error } object from Supabase
  unless noted otherwise, so callers can handle errors themselves.

  Table quick-reference
  ─────────────────────
  users              – user_id, email, role, first_name, last_name, phone, bio
  listings           – listing_id, student_id, title, description, status,
                       location_text, pricing_type, price_amount
  skills             – skill_id, name, is_active
  studentskills      – student_id, skill_id, proficiency, interest
  listingsskills     – listing_id, skill_id
  availabilityslots  – slot_id, student_id, start_at, end_at, status
  bookingrequests    – request_id, customer_id, listing_id,
                       requested_start_at, requested_end_at, note, status
  bookings           – bookings_id, request_id, customer_id, listing_id,
                       start_at, end_at, status, agreed_price_amount
  reviews            – id, student_email, client_email, rating, review_text
*/

// ─────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────

/** Fetch a single user by email. Used after Auth0 login to load profile + role. */
export async function getUserByEmail(email) {
  return await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
}

/** Fetch a single user by their numeric user_id. */
export async function getUserById(userId) {
  return await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();
}

/**
 * Insert a new user row, or update it if the email already exists.
 * Pass any subset of: { email, role, first_name, last_name, phone, bio }
 *
 * Example – create on first login:
 *   await upsertUser({ email: user.email, role: "client" });
 *
 * Example – update profile fields:
 *   await upsertUser({ email: user.email, first_name: "Rory", bio: "..." });
 */
export async function upsertUser({ email, role, first_name, last_name, phone, bio }) {
  return await supabase
    .from("users")
    .upsert(
      { email, role, first_name, last_name, phone, bio },
      { onConflict: "email" }
    )
    .select()
    .single();
}

/** Update specific profile fields for a user (by user_id). */
export async function updateUserProfile(userId, fields) {
  return await supabase
    .from("users")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();
}

// ─────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────

/** Get all active skills (for dropdowns / filter UI). */
export async function getAllSkills() {
  return await supabase
    .from("skills")
    .select("skill_id, name")
    .eq("is_active", true)
    .order("name");
}

/** Get all skills that belong to a specific student. */
export async function getSkillsForStudent(studentId) {
  return await supabase
    .from("studentskills")
    .select("proficiency, interest, skills(skill_id, name)")
    .eq("student_id", studentId);
}

/**
 * Add or update a skill on a student's profile.
 * proficiency and interest are integers (e.g. 1–5).
 */
export async function upsertStudentSkill(studentId, skillId, proficiency, interest) {
  return await supabase
    .from("studentskills")
    .upsert(
      { student_id: studentId, skill_id: skillId, proficiency, interest },
      { onConflict: "student_id,skill_id" }
    );
}

/** Remove a skill from a student's profile. */
export async function removeStudentSkill(studentId, skillId) {
  return await supabase
    .from("studentskills")
    .delete()
    .eq("student_id", studentId)
    .eq("skill_id", skillId);
}

/**
 * Get all students that have a specific skill.
 * Returns user rows joined through studentskills.
 * Pass a skill name string (e.g. "React") or a skill_id number.
 *
 * Usage (by name):  getStudentsBySkillName("React")
 * Usage (by id):    getStudentsBySkillId(3)
 */
export async function getStudentsBySkillName(skillName) {
  // First resolve the skill name to an id
  const { data: skill, error: skillError } = await supabase
    .from("skills")
    .select("skill_id")
    .eq("name", skillName)
    .single();

  if (skillError) return { data: null, error: skillError };
  return getStudentsBySkillId(skill.skill_id);
}

export async function getStudentsBySkillId(skillId) {
  return await supabase
    .from("studentskills")
    .select("student_id, proficiency, users(user_id, email, first_name, last_name, bio)")
    .eq("skill_id", skillId);
}

// ─────────────────────────────────────────────────
// LISTINGS  (student service listings)
// ─────────────────────────────────────────────────

/** Get all active listings, newest first. Good for the client "browse" page. */
export async function getActiveListings() {
  return await supabase
    .from("listings")
    .select(`
      listing_id, title, description, status,
      location_text, pricing_type, price_amount, created_at,
      users(user_id, first_name, last_name, email)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });
}

/** Get all listings created by a specific student. */
export async function getListingsByStudent(studentId) {
  return await supabase
    .from("listings")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
}

/** Get a single listing by id (includes the student's name). */
export async function getListingById(listingId) {
  return await supabase
    .from("listings")
    .select(`
      *,
      users(user_id, first_name, last_name, email),
      listingsskills(skills(skill_id, name))
    `)
    .eq("listing_id", listingId)
    .single();
}

/**
 * Create a new listing.
 * Required fields: { student_id, title, status, pricing_type, price_amount }
 * Optional:        { description, location_text }
 */
export async function createListing({ student_id, title, description, status = "active",
                                      location_text, pricing_type, price_amount }) {
  return await supabase
    .from("listings")
    .insert({ student_id, title, description, status, location_text, pricing_type, price_amount })
    .select()
    .single();
}

/** Update fields on an existing listing. Pass only the fields you want to change. */
export async function updateListing(listingId, fields) {
  return await supabase
    .from("listings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("listing_id", listingId)
    .select()
    .single();
}

/** Soft-delete: set a listing's status to "inactive". */
export async function deactivateListing(listingId) {
  return updateListing(listingId, { status: "inactive" });
}

/** Attach a skill tag to a listing. */
export async function addSkillToListing(listingId, skillId) {
  return await supabase
    .from("listingsskills")
    .upsert({ listing_id: listingId, skill_id: skillId }, { onConflict: "listing_id,skill_id" });
}

/** Remove a skill tag from a listing. */
export async function removeSkillFromListing(listingId, skillId) {
  return await supabase
    .from("listingsskills")
    .delete()
    .eq("listing_id", listingId)
    .eq("skill_id", skillId);
}

/**
 * Filter active listings by skill id.
 * Used on the client "browse" page when a skill filter is selected.
 */
export async function getListingsBySkill(skillId) {
  return await supabase
    .from("listingsskills")
    .select(`
      listings(
        listing_id, title, description, status,
        location_text, pricing_type, price_amount, created_at,
        users(user_id, first_name, last_name, email)
      )
    `)
    .eq("skill_id", skillId)
    .eq("listings.status", "active");
}

// ─────────────────────────────────────────────────
// AVAILABILITY SLOTS
// ─────────────────────────────────────────────────

/** Get all availability slots for a student. */
export async function getAvailabilityForStudent(studentId) {
  return await supabase
    .from("availabilityslots")
    .select("*")
    .eq("student_id", studentId)
    .order("start_at");
}

/** Add an availability slot for a student. status: "open" | "booked" */
export async function addAvailabilitySlot(studentId, startAt, endAt, status = "open") {
  return await supabase
    .from("availabilityslots")
    .insert({ student_id: studentId, start_at: startAt, end_at: endAt, status })
    .select()
    .single();
}

/** Update a slot's status (e.g. mark as "booked" when confirmed). */
export async function updateSlotStatus(slotId, status) {
  return await supabase
    .from("availabilityslots")
    .update({ status })
    .eq("slot_id", slotId)
    .select()
    .single();
}

// ─────────────────────────────────────────────────
// BOOKING REQUESTS
// ─────────────────────────────────────────────────

/**
 * Create a booking request (client → student).
 * Required: { customer_id, listing_id, requested_start_at, requested_end_at }
 * Optional: { note }
 * status defaults to "pending".
 */
export async function createBookingRequest({
  customer_id, listing_id, requested_start_at, requested_end_at, note
}) {
  return await supabase
    .from("bookingrequests")
    .insert({
      customer_id,
      listing_id,
      requested_start_at,
      requested_end_at,
      note,
      status: "pending",
    })
    .select()
    .single();
}

/** Get all booking requests sent by a specific client. */
export async function getBookingRequestsByClient(customerId) {
  return await supabase
    .from("bookingrequests")
    .select(`
      *,
      listings(title, price_amount, users(first_name, last_name))
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
}

/** Get all booking requests received for a student's listings. */
export async function getBookingRequestsForStudent(studentId) {
  return await supabase
    .from("bookingrequests")
    .select(`
      *,
      listings!inner(listing_id, title, student_id),
      users(first_name, last_name, email)
    `)
    .eq("listings.student_id", studentId)
    .order("created_at", { ascending: false });
}

/**
 * Update the status of a booking request.
 * status options: "pending" | "accepted" | "declined" | "cancelled"
 */
export async function updateBookingRequestStatus(requestId, status) {
  return await supabase
    .from("bookingrequests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("request_id", requestId)
    .select()
    .single();
}

// ─────────────────────────────────────────────────
// BOOKINGS  (confirmed, after request accepted)
// ─────────────────────────────────────────────────

/**
 * Confirm a booking request by creating a bookings row.
 * Call this after updateBookingRequestStatus(requestId, "accepted").
 */
export async function createBooking({
  request_id, customer_id, listing_id, start_at, end_at, agreed_price_amount
}) {
  return await supabase
    .from("bookings")
    .insert({
      request_id,
      customer_id,
      listing_id,
      start_at,
      end_at,
      status: "confirmed",
      agreed_price_amount,
    })
    .select()
    .single();
}

/** Get all bookings for a client. */
export async function getBookingsByClient(customerId) {
  return await supabase
    .from("bookings")
    .select(`
      *,
      listings(title, users(first_name, last_name))
    `)
    .eq("customer_id", customerId)
    .order("start_at");
}

/** Get all confirmed bookings for a student (via their listings). */
export async function getBookingsForStudent(studentId) {
  return await supabase
    .from("bookings")
    .select(`
      *,
      listings!inner(listing_id, title, student_id),
      users(first_name, last_name, email)
    `)
    .eq("listings.student_id", studentId)
    .order("start_at");
}

/** Update a booking's status. status: "confirmed" | "completed" | "cancelled" */
export async function updateBookingStatus(bookingId, status) {
  return await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("bookings_id", bookingId)
    .select()
    .single();
}

// ─────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────

/** Get reviews for a student (latest first). */
export async function getReviewsForStudent(studentEmail) {
  return await supabase
    .from("reviews")
    .select("id, student_email, client_email, rating, review_text, created_at")
    .eq("student_email", studentEmail)
    .order("created_at", { ascending: false });
}

/** Get average rating + total count for a student. Returns { data: { avg, count } } */
export async function getReviewSummary(studentEmail) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("student_email", studentEmail);

  if (error) return { data: null, error };

  const count = data.length;
  const avg = count === 0 ? 0 : data.reduce((sum, r) => sum + r.rating, 0) / count;

  return { data: { avg, count }, error: null };
}

/**
 * Create or update a review.
 * A client can only leave one review per student (unique on student_email + client_email).
 */
export async function upsertReview({ studentEmail, clientEmail, rating, reviewText }) {
  return await supabase
    .from("reviews")
    .upsert(
      { student_email: studentEmail, client_email: clientEmail, rating, review_text: reviewText },
      { onConflict: "student_email,client_email" }
    )
    .select()
    .single();
}
// ─────────────────────────────────────────────────
// JOB SEARCHING
// ─────────────────────────────────────────────────
//I probably don't need to get the skill names. The entry can just use the id,
//then get them in another function for display. It would clean this up a bit
/*
Search for jobs using skills. Order by average rating
The data used can be handled more on the front end side.
Takes skills in a format like (1, 2)
Only returns the number from numReturn. Calls can double this
*/
export async function getJobsBySkillsRatings(skills, numReturn) {
  return await supabase
  .from('listings')
  .select(
    `
    listing_id,
    student_id,
    title,
    description,
    status,
    location_text,
    pricing_type,
    pricing_amount,
    updated_at,
    ...reviews!inner(
      avg_rating:rating.avg()
    ),
    ...users!inner(),
    ...listingsskills!inner()
    `,
  )
  .eq('status', 'active')
  .in('listingsskills.skill_id', skills)
  .order('avg_rating')
  .limit(numReturn)
}

/*
Search for jobs using skills. Order by updated time
The data used can be handled more on the front end side.
Takes skills in a format like (1, 2)
Only returns the number from numReturn. Calls can double this
*/
export async function getJobsBySkillsTime(skills, numReturn){
  return await supabase
  .from('listings')
  .select(
    `
    listing_id,
    student_id,
    title,
    description,
    status,
    location_text,
    pricing_type,
    pricing_amount,
    updated_at,
    ...reviews!inner(
      avg_rating:rating.avg()
    ),
    ...users!inner(),
    ...listingsskills!inner()
    `,
  )
  .eq('status', 'active')
  .in('listingsskills.skill_id', skills)
  .order('updated_at')
  .limit(numReturn)
}
