-- Fix 1: Create a public faculty view with limited fields for student access
CREATE VIEW public.faculty_public AS
SELECT id, name, designation, department, is_active
FROM staff_profiles
WHERE designation IN ('HOD', 'Associate Professor', 'Assistant Professor')
  AND is_active = true;

-- Grant select permission on the view to authenticated users
GRANT SELECT ON public.faculty_public TO authenticated;

-- Fix 2: Drop the overly permissive RLS policy from staff_profiles
DROP POLICY IF EXISTS "Students can fetch faculty details" ON staff_profiles;

-- Fix 3: Add database constraints for input validation on applications table
-- Add check constraint for semester (1-8)
ALTER TABLE applications 
ADD CONSTRAINT check_semester_range 
CHECK (semester >= 1 AND semester <= 8);

-- Clean up duplicate applications (keep the most recent one for each student/semester/batch combination)
DELETE FROM applications a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (student_id, semester, batch) id
  FROM applications
  ORDER BY student_id, semester, batch, created_at DESC
);

-- Add unique constraint to prevent future duplicate applications
ALTER TABLE applications 
ADD CONSTRAINT unique_student_semester_application 
UNIQUE (student_id, semester, batch);