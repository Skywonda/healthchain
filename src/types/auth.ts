import { DoctorProfile, PatientProfile } from "./user";

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'EMERGENCY_RESPONDER';

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  // Doctor specific
  specialization?: string;
  licenseNumber?: string;
  hospitalName?: string;
  // Patient specific
  dateOfBirth?: Date;
  gender?: string;
  phoneNumber?: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mfaEnabled: boolean;
  patient?: PatientProfile;
  doctor?: DoctorProfile;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}