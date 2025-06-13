import { AccessType } from "./consent";

export interface SharingSettings {
  id: string;
  patientId: string;
  allowEmergencyAccess: boolean;
  autoApproveSpecialists: boolean;
  defaultConsentDuration?: number;
  allowedDataTypes: string[];
  restrictedDataTypes: string[];
  allowedSpecializations: string[];
  emergencyContacts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareRequest {
  recipientEmail: string;
  recordIds: string[];
  purpose: string;
  accessType: AccessType;
  duration?: number; // days
  message?: string;
}