// app/api/records/access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getBlockchainService } from '@/lib/blockchain';
import { getServerUser } from '@/middleware';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = getServerUser(request);
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { recordId, purpose, encryptionKey } = await request.json();

    if (!recordId || !purpose || !encryptionKey) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: {
        patient: {
          include: { user: true }
        }
      }
    });

    if (!record) {
      return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    }

    const blockchainService = getBlockchainService();
    await blockchainService.connectWallet(process.env.ADMIN_PRIVATE_KEY);

    const blockchainResult = await blockchainService.accessRecord(
      recordId,
      purpose,
      encryptionKey
    );

    await prisma.accessLog.create({
      data: {
        recordId,
        accessorId: user.id,
        accessType: 'READ',
        purpose,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        accessedFields: ['fileData'],
        downloadedFiles: [record.fileName],
        blockchainTxHash: blockchainResult.transaction.hash,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ACCESS',
        resourceType: 'MEDICAL_RECORD',
        resourceId: recordId,
        details: {
          purpose,
          patientId: record.patientId,
          txHash: blockchainResult.transaction.hash,
        }
      }
    });

    return NextResponse.json({
      message: 'Record accessed successfully',
      access: {
        recordId,
        accessedAt: new Date().toISOString(),
        fileSize: blockchainResult.fileData.length,
        blockchain: {
          txHash: blockchainResult.transaction.hash,
          ipfsHash: blockchainResult.ipfsHash,
        }
      },
      fileData: Array.from(blockchainResult.fileData), // Convert to array for JSON
    });

  } catch (error) {
    console.error('Record access error:', error);
    return NextResponse.json(
      { message: 'Failed to access record', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}