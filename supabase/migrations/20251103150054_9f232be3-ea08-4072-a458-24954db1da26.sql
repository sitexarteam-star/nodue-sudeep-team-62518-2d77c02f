-- Allow staff and faculty to view student profiles
CREATE POLICY "Staff and faculty can view student profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('library', 'hostel', 'lab_instructor', 'college_office', 'faculty', 'hod')
  )
);