const MAP_KEY = "role_by_email";  // JSON object: { "a@b.com": "student" }
const SIGNUP_KEY = "signup_role"; // "student" | "client" (temporary during signup)

export function getSignupRole() {
  return localStorage.getItem(SIGNUP_KEY);
}

export function clearSignupRole() {
  localStorage.removeItem(SIGNUP_KEY);
}

export function setRoleForEmail(email, role) {
  if (!email || !role) return;
  const map = JSON.parse(localStorage.getItem(MAP_KEY) || "{}");
  map[email.toLowerCase()] = role;
  localStorage.setItem(MAP_KEY, JSON.stringify(map));
}

export function getRoleForEmail(email) {
  if (!email) return null;
  const map = JSON.parse(localStorage.getItem(MAP_KEY) || "{}");
  return map[email.toLowerCase()] || null;
}