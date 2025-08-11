export const APP_CONFIG = {
  name: 'HealthChain',
  description: 'Secure Blockchain-Based Health Records System',
  version: '1.0.0',
  supportEmail: 'support@healthchain.com',
};

export const RECORD_TYPES = {
  MEDICAL_REPORT: 'Medical Report',
  LAB_RESULT: 'Lab Result',
  PRESCRIPTION: 'Prescription',
  IMAGING: 'Medical Imaging',
  VACCINE_RECORD: 'Vaccine Record',
  ALLERGY_INFO: 'Allergy Information',
  EMERGENCY_CONTACT: 'Emergency Contact',
} as const;

export const RECORD_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "MEDICAL_REPORT", label: "Medical Report" },
  { value: "LAB_RESULT", label: "Lab Result" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "IMAGING", label: "Medical Imaging" },
  { value: "VACCINE_RECORD", label: "Vaccine Record" },
  { value: "ALLERGY_INFO", label: "Allergy Information" },
];

export const ACCESS_TYPES = {
  READ: 'Read Only',
  WRITE: 'Read & Write',
  EMERGENCY: 'Emergency Access',
} as const;

export const USER_ROLES = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  ADMIN: 'Administrator',
  EMERGENCY_RESPONDER: 'Emergency Responder',
} as const;

export const NOTIFICATION_TYPES = {
  ACCESS_REQUEST: 'Access Request',
  CONSENT_GRANTED: 'Consent Granted',
  CONSENT_REVOKED: 'Consent Revoked',
  DATA_ACCESSED: 'Data Accessed',
  RECORD_SHARED: 'Record Shared',
  EMERGENCY_ACCESS: 'Emergency Access',
  VERIFICATION_UPDATE: 'Verification Update',
  SYSTEM_ALERT: 'System Alert',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PATIENT_DASHBOARD: '/patient',
  DOCTOR_DASHBOARD: '/doctor',
  ADMIN_DASHBOARD: '/admin',
  PROFILE: '/profile',
  RECORDS: '/records',
  CONSENT: '/consent',
  SHARING: '/sharing',
  AUDIT: '/audit',
} as const;