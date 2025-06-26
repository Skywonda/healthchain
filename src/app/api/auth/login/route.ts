import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        patient: true,
        doctor: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.mfaEnabled && !validatedData.mfaCode) {
      return NextResponse.json(
        { 
          message: 'MFA code required',
          requiresMFA: true 
        },
        { status: 200 }
      );
    }

    const profileData = user.role === 'PATIENT' ? user.patient : user.doctor;

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
    };

    const token = await AuthService.generateJWT(tokenPayload, '7d');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const sessionToken = await AuthService.generateJWT({ userId: user.id }, '7d');
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resourceType: 'USER',
        resourceId: user.id,
        details: {
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      }
    });

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        patient: user.patient,
        doctor: user.doctor,
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}