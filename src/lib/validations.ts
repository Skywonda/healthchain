import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaCode: z.string().optional(),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

const baseRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
});

export const patientRegistrationSchema = baseRegistrationSchema.extend({
  role: z.literal('PATIENT'),
  dateOfBirth: z.coerce.date().refine(date => {
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= 0 && age <= 150;
  }, 'Invalid date of birth'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const doctorRegistrationSchema = baseRegistrationSchema.extend({
  role: z.literal('DOCTOR'),
  specialization: z.string().min(2, 'Specialization is required'),
  licenseNumber: z.string().min(5, 'License number is required'),
  hospitalName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const medicalRecordSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  recordType: z.enum([
    'MEDICAL_REPORT',
    'LAB_RESULT', 
    'PRESCRIPTION',
    'IMAGING',
    'VACCINE_RECORD',
    'ALLERGY_INFO',
    'EMERGENCY_CONTACT'
  ]),
  tags: z.array(z.string()).optional(),
});

export const accessRequestSchema = z.object({
  patientEmail: z.string().email('Invalid patient email'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  accessType: z.enum(['READ', 'WRITE', 'EMERGENCY']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional(),
  requestedRecordTypes: z.array(z.string()).min(1, 'Select at least one record type'),
  requestedDuration: z.number().min(1).max(365).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});