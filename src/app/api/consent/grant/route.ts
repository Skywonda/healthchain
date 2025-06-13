
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      doctorId,
      purpose,
      accessType,
      permissions,
      allowedRecordTypes,
      allowedRecordIds,
      expiresAt
    } = await request.json();

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      );
    }

    const consent = await prisma.consentGrant.create({
      data: {
        patientId: session.user.patientId,
        doctorId,
        purpose,
        accessType,
        permissions,
        allowedRecordTypes,
        allowedRecordIds,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: 'GRANTED',
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'GRANT',
        resourceType: 'CONSENT',
        resourceId: consent.id,
        details: {
          doctorId,
          purpose,
          accessType,
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
          patientId: session.user.patientId,
        },
        category: 'CONSENT',
        priority: 'NORMAL',
      }
    });

    return NextResponse.json({
      message: 'Consent granted successfully',
      consent
    });

  } catch (error) {
    console.error('Consent grant error:', error);
    return NextResponse.json(
      { message: 'Failed to grant consent' },
      { status: 500 }
    );
  }
}