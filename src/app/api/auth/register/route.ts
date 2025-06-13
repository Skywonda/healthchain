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
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: role,
      }
    });

    if (role === 'PATIENT') {
      const patientData = validatedData as any;
      await prisma.patient.create({
        data: {
          userId: user.id,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          phoneNumber: patientData.phoneNumber,
          address: patientData.address,
        }
      });
    } else if (role === 'DOCTOR') {
      const doctorData = validatedData as any;
      await prisma.doctor.create({
        data: {
          userId: user.id,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          specialization: doctorData.specialization,
          licenseNumber: doctorData.licenseNumber,
          hospitalName: doctorData.hospitalName,
          phoneNumber: doctorData.phoneNumber,
          verificationStatus: 'PENDING',
        }
      });
    }

    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}