import { AuditLog } from "./audit";

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface HealthSystemStats {
  totalPatients: number;
  totalDoctors: number;
  totalRecords: number;
  totalConsents: number;
  recentActivity: AuditLog[];
  systemHealth: {
    database: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
    blockchain: 'healthy' | 'warning' | 'critical';
  };
}