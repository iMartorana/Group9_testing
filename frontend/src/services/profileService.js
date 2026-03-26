import { supabase} from "../supabaseconfig";
import { getUserByEmail } from "./supabaseapi";

export async function getProfileByEmail(email) {
  const { data, error } = await getUserByEmail(email);

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function updateProfile(email, updates) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("email", email)
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}