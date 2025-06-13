// src/app/api/records/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StorageService } from '@/lib/storage';
import { EncryptionService } from '@/lib/encryption';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const recordType = formData.get('recordType') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');

    if (!file || !title || !recordType) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload file to storage (encrypted)
    const uploadResult = await StorageService.uploadFile(file, 'medical-records');

    // Create record in database
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: session.user.patientId, // Assume this is set in session
        title,
        description,
        recordType: recordType as any,
        fileUrl: uploadResult.url,
        fileHash: uploadResult.hash,
        fileName: file.name,
        fileSize: uploadResult.size,
        mimeType: file.type,
        tags,
        isEncrypted: true,
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resourceType: 'MEDICAL_RECORD',
        resourceId: record.id,
        details: {
          recordTitle: title,
          recordType,
          fileSize: uploadResult.size,
        }
      }
    });

    return NextResponse.json({
      message: 'Record uploaded successfully',
      record
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed' },
      { status: 500 }
    );
  }
}