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

    const {
      doctorId,
      doctorWalletAddress,
      purpose,
      accessType,
      permissions,
      allowedRecordTypes,
      allowedRecordIds,
      expiresAt,
      duration
    } = await request.json();

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
    }

    const blockchainService = getBlockchainService();
    await blockchainService.connectWallet(process.env.ADMIN_PRIVATE_KEY);

    const durationInSeconds = duration ? duration * 24 * 60 * 60 : 0;
    
    const blockchainResult = await blockchainService.grantConsent(
      doctorWalletAddress,
      allowedRecordIds,
      accessType,
      durationInSeconds,
      purpose
    );

    const consent = await prisma.consentGrant.create({
      data: {
        patientId: user.patientId!,
        doctorId,
        purpose,
        accessType,
        permissions,
        allowedRecordTypes,
        allowedRecordIds,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: 'GRANTED',
        
        // Blockchain integration
        blockchainTxHash: blockchainResult.transaction.hash,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'GRANT',
        resourceType: 'CONSENT',
        resourceId: consent.id,
        details: {
          doctorId,
          purpose,
          accessType,
          blockchainConsentId: blockchainResult.consentId,
          txHash: blockchainResult.transaction.hash,
        }
      }
    });

    await prisma.notification.create({
      data: {
        recipientId: doctor.userId,
        type: 'CONSENT_GRANTED',
        title: 'Access Granted',
        message: `Patient has granted you access to their medical records.`,
        data: {
          consentId: consent.id,
          patientId: user.patientId,
          blockchainConsentId: blockchainResult.consentId,
        },
        category: 'CONSENT',
        priority: 'NORMAL',
      }
    });

    return NextResponse.json({
      message: 'Consent granted successfully',
      consent: {
        id: consent.id,
        status: consent.status,
        grantedAt: consent.grantedAt,
        blockchain: {
          consentId: blockchainResult.consentId,
          txHash: blockchainResult.transaction.hash,
        }
      }
    });

  } catch (error) {
    console.error('Consent grant error:', error);
    return NextResponse.json(
      { message: 'Failed to grant consent', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}