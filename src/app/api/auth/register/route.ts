import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { patientRegistrationSchema, doctorRegistrationSchema } from '@/lib/validations';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    let validatedData;
    if (role === 'PATIENT') {
      validatedData = patientRegistrationSchema.parse(body);
    } else if (role === 'DOCTOR') {
      validatedData = doctorRegistrationSchema.parse(body);
    } else {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(validatedData.password, 12);

    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      const user = await tx.user.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          password: hashedPassword,
          role: role,
        }
      });

      if (role === 'PATIENT') {
        const patientData = validatedData as any;
        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            dateOfBirth: new Date(patientData.dateOfBirth),
            gender: patientData.gender,
            phoneNumber: patientData.phoneNumber,
            address: patientData.address,
            emergencyContact: patientData.emergencyContact,
            allergies: [],
            chronicConditions: [],
            medications: [],
          }
        });

        await tx.sharingSettings.create({
          data: {
            patientId: patient.id,
            allowEmergencyAccess: true,
            autoApproveSpecialists: false,
            allowedDataTypes: ['MEDICAL_REPORT', 'LAB_RESULT', 'PRESCRIPTION'],
            restrictedDataTypes: [],
            allowedSpecializations: [],
            emergencyContacts: [],
          }
        });

        return { user, profile: patient };
      } else if (role === 'DOCTOR') {
        const doctorData = validatedData as any;
        const doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            specialization: doctorData.specialization,
            licenseNumber: doctorData.licenseNumber,
            hospitalName: doctorData.hospitalName,
            phoneNumber: doctorData.phoneNumber,
            verificationStatus: 'PENDING',
            verificationDocs: [],
          }
        });

        return { user, profile: doctor };
      }

      return { user, profile: null };
    });

    await prisma.auditLog.create({
      data: {
        userId: result.user.id,
        action: 'CREATE',
        resourceType: 'USER',
        resourceId: result.user.id,
        details: {
          role: role,
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      }
    });

    return NextResponse.json(
      { 
        message: role === 'DOCTOR' 
          ? 'Registration successful! Your account is pending verification.'
          : 'Registration successful! You can now log in.',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          message: 'Invalid input data', 
          errors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'A user with this email or license number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}