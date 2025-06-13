import { Allergy, ChronicCondition, EmergencyContact, Medication } from "./user";

export interface PatientRegistrationForm {
  // User fields
  email: string;
  password: string;
  confirmPassword: string;
  
  // Patient fields
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber?: string;
  address?: string;
  
  // Medical fields
  bloodType?: string;
  allergies?: Allergy[];
  chronicConditions?: ChronicCondition[];
  medications?: Medication[];
  
  // Emergency contact
  emergencyContact?: EmergencyContact;
}

export interface DoctorRegistrationForm {
  // User fields
  email: string;
  password: string;
  confirmPassword: string;
  
  // Doctor fields
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  hospitalName?: string;
  phoneNumber?: string;
  
  // Verification documents
  verificationDocs: File[];
}