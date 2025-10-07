import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("Supabase env variables missing");
}

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
