import { createClient } from "@supabase/supabase-js";

import env from "./env.js";

// Create a single supabase client for interacting with your database
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export default supabase;
