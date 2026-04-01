import { supabase } from "../supabaseconfig";

export async function getActiveSkills() {
  const { data, error } = await supabase
    .from("skills")
    .select("skill_id, name")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

export async function getProfileSkills(userId) {
  const { data, error } = await supabase
    .from("studentskills")
    .select("skill_id")
    .eq("student_id", userId);

  if (error) throw error;

  return data.map((row) => row.skill_id);
}

export async function saveProfileSkills(userId, skillIds) {
  const { error: deleteError } = await supabase
    .from("studentskills")
    .delete()
    .eq("student_id", userId);

  if (deleteError) throw deleteError;

  if (!skillIds.length) return true;

  const rows = skillIds.map((skillId) => ({
    student_id: userId,
    skill_id: skillId,
  }));

  const { error: insertError } = await supabase
    .from("studentskills")
    .insert(rows);

  if (insertError) throw insertError;

  return true;
}