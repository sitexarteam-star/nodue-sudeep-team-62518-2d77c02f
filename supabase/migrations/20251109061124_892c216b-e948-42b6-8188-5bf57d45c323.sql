-- Remove the restrictive RLS policy that only allows viewing counsellor and class_advisor roles
-- This policy is no longer needed since we're fetching all staff directly from staff_profiles

DROP POLICY IF EXISTS "Anyone can view counsellor and class_advisor roles" ON public.user_roles;