export interface Notification {
  id: string;
  senderId?: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  category: 'SECURITY' | 'CONSENT' | 'MEDICAL' | 'SYSTEM';
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'ACCESS_REQUEST'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'DATA_ACCESSED'
  | 'RECORD_SHARED'
  | 'EMERGENCY_ACCESS'
  | 'VERIFICATION_UPDATE'
  | 'SYSTEM_ALERT';