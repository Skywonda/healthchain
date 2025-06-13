import { AccessType } from "./consent";

export interface AccessLog {
  id: string;
  recordId: string;
  accessorId: string;
  accessType: AccessType;
  purpose?: string;
  ipAddress?: string;
  userAgent?: string;
  accessedFields: string[];
  downloadedFiles: string[];
  accessedAt: Date;
  duration?: number;
  blockchainTxHash?: string;
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