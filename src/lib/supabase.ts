// Typed client is great when types are in sync, but during development the
// auto-generated types may lag behind. This wrapper widens the client type to
// avoid 'never' errors while keeping runtime the same.
import { supabase as baseClient } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export const supabase = baseClient as unknown as SupabaseClient<any>;
