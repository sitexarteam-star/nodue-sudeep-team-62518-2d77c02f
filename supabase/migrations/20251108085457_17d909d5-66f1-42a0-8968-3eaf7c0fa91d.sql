-- Add RLS policy to ensure students can only login if their batch exists
CREATE POLICY "Students must belong to valid batch"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Allow if user is viewing their own profile AND either:
  -- 1. They are not a student (no batch requirement), OR
  -- 2. They are a student with a valid batch that exists in batches table
  auth.uid() = id AND (
    batch IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.batches WHERE name = profiles.batch
    ) OR
    -- Allow admin and staff to access regardless
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'library', 'hostel', 'college_office', 'faculty', 'hod', 'lab_instructor')
    )
  )
);

-- Add index for better performance on batch lookups
CREATE INDEX IF NOT EXISTS idx_profiles_batch ON public.profiles(batch) WHERE batch IS NOT NULL;