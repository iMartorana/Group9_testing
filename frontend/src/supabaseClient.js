import { createClient } from "@supabase/supabase-js";

console.log("FULL ENV:", import.meta.env);
console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("SUPABASE KEY:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export default createClient(supabaseUrl, supabaseAnonKey);