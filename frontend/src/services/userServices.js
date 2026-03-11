import { supabase} from "../supabaseconfig";

// get all users
export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

// create new user profile
export async function createUser(user) {
  const { data, error } = await supabase
    .from("users")
    .insert([user]);

  if (error) {
    console.error(error);
  }

  return data;
}

// get user by email
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}