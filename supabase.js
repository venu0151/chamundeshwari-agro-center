const SUPABASE_URL = "https://orihwncjkegwgtiaztnw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_a1QtLnBRoBWcWuXA5GCCTg_AX0mmKti";

const { createClient } = window.supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);