-- Enable realtime for application_subject_faculty table
-- This allows the student dashboard to receive instant updates when faculty approve/reject applications
ALTER PUBLICATION supabase_realtime ADD TABLE application_subject_faculty;