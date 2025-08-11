import { z } from 'zod';
import type { RecordType } from '@/types/medical-records';

export const medicalRecordUploadSchema = z.object({
  file: z.instanceof(File),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  recordType: z.custom<RecordType>((val) =>
    [
      'MEDICAL_REPORT',
      'LAB_RESULT',
      'PRESCRIPTION',
      'IMAGING',
      'VACCINE_RECORD',
      'ALLERGY_INFO',
      'EMERGENCY_CONTACT',
    ].includes(val as string),
    { message: 'Invalid record type' }
  ),
  tags: z.array(z.string()).optional(),
  walletAddress: z.string().min(10, 'Invalid wallet address'),
});

export type MedicalRecordUploadPayload = z.infer<typeof medicalRecordUploadSchema>; 