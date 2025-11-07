-- One-time fix: Create notifications for college office staff for pending applications
-- This finds applications that are waiting for college office verification but don't have notifications

DO $$
DECLARE
  app_record RECORD;
  staff_record RECORD;
  student_record RECORD;
  notification_exists BOOLEAN;
BEGIN
  -- Loop through applications pending college office verification
  FOR app_record IN 
    SELECT a.id, a.student_id, a.department, a.semester
    FROM applications a
    INNER JOIN profiles p ON p.id = a.student_id
    WHERE a.college_office_verified = false
    AND (
      (p.student_type = 'local' AND a.library_verified = true) OR
      (p.student_type = 'hostel' AND a.hostel_verified = true)
    )
  LOOP
    -- Get student details
    SELECT name, usn INTO student_record
    FROM profiles
    WHERE id = app_record.student_id;
    
    -- Loop through college office staff
    FOR staff_record IN 
      SELECT user_id FROM get_users_by_role('college_office')
    LOOP
      -- Check if notification already exists for this staff-application combo
      SELECT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = staff_record.user_id
        AND related_entity_type = 'application'
        AND related_entity_id = app_record.id
        AND type = 'info'
      ) INTO notification_exists;
      
      -- Create notification if it doesn't exist
      IF NOT notification_exists THEN
        INSERT INTO notifications (
          user_id,
          title,
          message,
          type,
          related_entity_type,
          related_entity_id
        ) VALUES (
          staff_record.user_id,
          'New Application Ready for Verification',
          format('Application from %s (USN: %s) - %s Department, Semester %s is ready for college office verification.',
            student_record.name,
            student_record.usn,
            app_record.department,
            app_record.semester
          ),
          'info',
          'application',
          app_record.id
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;