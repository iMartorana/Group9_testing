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

export async function getProfileSkills(studentId) {
  const { data, error } = await supabase
    .from("studentskills")
    .select("skill_id")
    .eq("student_id", studentId);

  if (error) throw error;

  return data.map((row) => row.skill_id);
}

export async function saveProfileSkills(studentId, skillIds) {
  const { error: deleteError } = await supabase
    .from("studentskills")
    .delete()
    .eq("student_id", studentId);

  if (deleteError) throw deleteError;

  if (!skillIds.length) return true;

  const rows = skillIds.map((skillId) => ({
    student_id: studentId,
    skill_id: skillId,
  }));

  const { error: insertError } = await supabase
    .from("studentskills")
    .insert(rows);

  if (insertError) throw insertError;

  return true;
}