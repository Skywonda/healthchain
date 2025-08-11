import { AccessType } from "./consent";

export type RecordType = 
  | 'MEDICAL_REPORT'
  | 'LAB_RESULT' 
  | 'PRESCRIPTION'
  | 'IMAGING'
  | 'VACCINE_RECORD'
  | 'ALLERGY_INFO'
  | 'EMERGENCY_CONTACT';

// export interface MedicalRecord {
//   id: string;
//   patientId: string;
//   doctorId?: string;
//   title: string;
//   description?: string;
//   recordType: RecordType;
//   fileUrl: string;
//   fileHash: string;
//   fileName: string;
//   fileSize: number;
//   mimeType: string;
//   blockchainTxHash?: string;
//   ipfsHash?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   isEncrypted: boolean;
//   tags: string[];
// }

export interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  recordType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  tags: string[];
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

export interface FileUploadData {
  file: File;
  title: string;
  description?: string;
  recordType: RecordType;
  tags?: string[];
}

export interface RecordAccess {
  recordId: string;
  accessorId: string;
  accessType: AccessType;
  grantedAt: Date;
  expiresAt?: Date;
}