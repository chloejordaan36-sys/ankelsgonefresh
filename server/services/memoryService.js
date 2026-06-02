const supabase = require("../config/supabase");

async function getMemory(user_id) {
  const { data } = await supabase
    .from("memory")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

async function getLongMemory(user_id) {
  const { data } = await supabase
    .from("long_term_memory")
    .select("*")
    .eq("user_id", user_id)
    .order("importance", {
      ascending: false
    });

  return data || [];
}

module.exports = {
  getMemory,
  getLongMemory
};