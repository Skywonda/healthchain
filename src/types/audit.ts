import { AccessType } from "./consent";

export interface AccessLog {
  id: string;
  recordId: string;
  record: {
    title: string;
    recordType: string;
  };
  accessor: {
    firstName: string;
    lastName: string;
    specialization?: string;
    hospitalName?: string;
  };
  accessType: AccessType;
  purpose?: string;
  ipAddress?: string;
  userAgent?: string;
  accessedFields: string[];
  downloadedFiles: string[];
  accessedAt: string;
  duration?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
  blockchainTxHash?: string;
}