import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getBlockchainService } from '@/lib/blockchain';
import { getServerUser } from '@/middleware';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = getServerUser(request);
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const recordType = formData.get('recordType') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const walletAddress = formData.get('walletAddress') as string;

    if (!file || !title || !recordType || !walletAddress) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const blockchainService = getBlockchainService();
    await blockchainService.connectWallet(process.env.ADMIN_PRIVATE_KEY);

    const metadata = {
      title,
      description,
      recordType,
      tags,
      patientId: user.patientId,
      uploadedAt: new Date().toISOString(),
    };

    const blockchainResult = await blockchainService.createMedicalRecord(
      file,
      recordType as any,
      metadata
    );

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: user.patientId!,
        title,
        description,
        recordType: recordType as any,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        tags,
        
        // Blockchain integration
        fileUrl: `ipfs://${blockchainResult.ipfsHash}`,
        fileHash: blockchainResult.ipfsHash,
        blockchainTxHash: blockchainResult.transaction.hash,
        ipfsHash: blockchainResult.ipfsHash,
        
        isEncrypted: true,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        resourceType: 'MEDICAL_RECORD',
        resourceId: record.id,
        details: {
          recordTitle: title,
          recordType,
          fileSize: file.size,
          blockchainRecordId: blockchainResult.recordId,
          txHash: blockchainResult.transaction.hash,
        }
      }
    });

    return NextResponse.json({
      message: 'Record uploaded successfully',
      record: {
        id: record.id,
        title: record.title,
        recordType: record.recordType,
        createdAt: record.createdAt,
        blockchain: {
          recordId: blockchainResult.recordId,
          txHash: blockchainResult.transaction.hash,
          ipfsHash: blockchainResult.ipfsHash,
        }
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}