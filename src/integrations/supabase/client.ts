// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tfsvjmiusvzapcblhqrs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc3ZqbWl1c3Z6YXBjYmxocXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTEyNzYsImV4cCI6MjA2NjQ2NzI3Nn0.6f3pxKdn61EAJ1xPm45mPuidfvr_2fsRtZofEPhBfmk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);