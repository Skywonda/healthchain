import { UserRole } from "./auth";

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: Date;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: EmergencyContact;
  bloodType?: string;
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  medications: Medication[];
  blockchainAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  hospitalId?: string;
  hospitalName?: string;
  phoneNumber?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: Date;
  verificationDocs: VerificationDoc[];
  blockchainAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface Allergy {
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction: string;
  diagnosedDate?: Date;
}

export interface ChronicCondition {
  condition: string;
  diagnosedDate: Date;
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
}

export interface VerificationDoc {
  type: 'LICENSE' | 'DIPLOMA' | 'CERTIFICATION';
  url: string;
  uploadedAt: Date;
}