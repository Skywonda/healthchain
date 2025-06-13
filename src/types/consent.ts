export type ConsentStatus = 'GRANTED' | 'REVOKED' | 'EXPIRED';
export type AccessType = 'READ' | 'WRITE' | 'EMERGENCY';

export interface Permission {
  resourceType: string;
  actions: string[];
  recordTypes: string[];
}

export interface ConsentGrant {
  id: string;
  patientId: string;
  doctorId: string;
  status: ConsentStatus;
  accessType: AccessType;
  purpose: string;
  permissions: Permission[];
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  blockchainTxHash?: string;
  allowedRecordTypes: string[];
  allowedRecordIds: string[];
}

export interface AccessRequest {
  id: string;
  doctorId: string;
  patientEmail: string;
  patientId?: string;
  purpose: string;
  accessType: AccessType;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  requestedRecordTypes: string[];
  requestedDuration?: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  requestedAt: Date;
  respondedAt?: Date;
  response?: string;
}

export interface ConsentSettings {
  allowEmergencyAccess: boolean;
  autoApproveSpecialists: boolean;
  defaultConsentDuration?: number;
  allowedDataTypes: string[];
  restrictedDataTypes: string[];
  allowedSpecializations: string[];
  emergencyContacts: string[];
}

export interface SharingSettings {
  allowEmergencyAccess: boolean;
  autoApproveSpecialists: boolean;
  defaultConsentDuration?: number;
  allowedDataTypes: string[];
  restrictedDataTypes: string[];
  allowedSpecializations: string[];
  emergencyContacts: string[];
}