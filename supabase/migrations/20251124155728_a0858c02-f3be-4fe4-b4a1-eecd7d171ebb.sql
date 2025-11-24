-- Add columns to track who verified each stage of the application
ALTER TABLE applications 
  ADD COLUMN library_verified_by uuid REFERENCES staff_profiles(id),
  ADD COLUMN hostel_verified_by uuid REFERENCES staff_profiles(id),
  ADD COLUMN college_office_verified_by uuid REFERENCES staff_profiles(id),
  ADD COLUMN hod_verified_by uuid REFERENCES staff_profiles(id),
  ADD COLUMN lab_verified_by uuid REFERENCES staff_profiles(id);