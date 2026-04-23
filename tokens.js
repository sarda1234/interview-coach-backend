const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// Generate a new token and save to database
async function generateToken() {
  const token = require("crypto").randomBytes(16).toString("hex");
  const { error } = await supabase.from("tokens").insert([{ token }]);
  if (error) throw error;
  return token;
}

// Verify token is valid and unused
async function verifyToken(token) {
  const { data, error } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", token)
    .eq("used", false)
    .single();
  if (error || !data) return false;
  return true;
}

// Mark token as used
async function useToken(token) {
  const { error } = await supabase
    .from("tokens")
    .update({ used: true, used_at: new Date() })
    .eq("token", token);
  if (error) throw error;
}

module.exports = { generateToken, verifyToken, useToken };