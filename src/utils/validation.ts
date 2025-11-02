import { z } from 'zod';

// Student validation schema
export const studentSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  usn: z.string()
    .trim()
    .regex(/^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2,4}[0-9]{3}$/, 'Invalid USN format (e.g., 4NI21CS001)'),
});

// Subject validation schema
export const subjectSchema = z.object({
  code: z.string()
    .trim()
    .min(3, 'Subject code must be at least 3 characters')
    .max(20, 'Subject code must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Subject code must contain only uppercase letters and numbers'),
  name: z.string()
    .trim()
    .min(3, 'Subject name must be at least 3 characters')
    .max(200, 'Subject name must be less than 200 characters'),
  semester: z.number()
    .int('Semester must be a whole number')
    .min(1, 'Semester must be at least 1')
    .max(8, 'Semester must be at most 8'),
  department: z.string().min(1, 'Department is required'),
  is_elective: z.boolean().optional(),
});

// Staff/Admin profile validation schema
export const staffProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .trim()
    .regex(/^\d{10}$/, 'Phone must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  designation: z.string()
    .max(100, 'Designation too long')
    .optional(),
  department: z.enum(['MECH', 'CSE', 'CIVIL', 'EC', 'AIML', 'CD'])
    .optional()
    .nullable(),
  office_location: z.string()
    .max(200, 'Office location too long')
    .optional()
});

export type StudentInput = z.infer<typeof studentSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type StaffProfileInput = z.infer<typeof staffProfileSchema>;
