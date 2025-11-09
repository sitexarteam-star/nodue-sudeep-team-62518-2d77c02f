-- Add counsellor and class_advisor to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'counsellor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'class_advisor';