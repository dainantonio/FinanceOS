import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hiujsexdunwnwbcgyaos.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdWpzZXhkdW53bndiY2d5YW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzIxMTksImV4cCI6MjA4ODc0ODExOX0.t55iGWgVdzel3MAbSKCFyUYL4SxqqHIFvrqFBH04Ajo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
