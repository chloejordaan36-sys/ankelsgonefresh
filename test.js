const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL || "https://ybthrnrnhevqjpiwqrub.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGhybnJuaGV2cWpwaXdxcnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDI0OTU0MCwiZXhwIjoyMDk1ODI1NTQwfQ.ywar9Zy0o4IgLyxH2uciAviUnS85vtL0JVI_TUhzyj8"
);

async function test() {
  // INSERT test
  const { data: insertData, error: insertError } = await supabase
    .from("users")
    .insert([
      { name: "Floors", sport: "basketball" }
    ])
    .select();

  console.log("INSERT DATA:", insertData);
  console.log("INSERT ERROR:", insertError);

  // READ test
  const { data, error } = await supabase
    .from("users")
    .select("*");

  console.log("ALL USERS:", data);
  console.log("READ ERROR:", error);
}

test();