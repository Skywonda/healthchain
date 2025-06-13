import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { UserRole } from './types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret'
);
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/patient': ['PATIENT'],
  '/patient/profile': ['PATIENT'],
  '/patient/records': ['PATIENT'],
  '/patient/consent': ['PATIENT'],
  '/patient/sharing': ['PATIENT'],
  '/patient/audit': ['PATIENT'],
  
  '/doctor': ['DOCTOR'],
  '/doctor/patients': ['DOCTOR'],
  '/doctor/requests': ['DOCTOR'],
  '/doctor/reports': ['DOCTOR'],
  
  '/admin': ['ADMIN'],
  '/admin/verification': ['ADMIN'],
  '/admin/system': ['ADMIN'],
  '/admin/audit': ['ADMIN'],
  
  '/profile': ['PATIENT', 'DOCTOR', 'ADMIN'],
  '/notifications': ['PATIENT', 'DOCTOR', 'ADMIN'],
  '/settings': ['PATIENT', 'DOCTOR', 'ADMIN'],
} as const;

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
];

const PUBLIC_API_ROUTES: string[] = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
];

interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  exp?: number;
}

async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      exp: payload?.exp
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === pathname) return true;
    if (route.includes('[') && route.includes(']')) {
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return false;
  });
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
}

function hasRequiredRole(userRole: UserRole, pathname: string): boolean {
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchingRoute) {
    return true;
  }

  const requiredRoles = ROUTE_PERMISSIONS[matchingRoute as keyof typeof ROUTE_PERMISSIONS];
  return requiredRoles.includes(userRole);
}

function getRedirectUrl(userRole: string): string {
  switch (userRole) {
    case 'PATIENT':
      return '/patient';
    case 'DOCTOR':
      return '/doctor';
    case 'ADMIN':
      return '/admin';
    default:
      return '/';
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/callback') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    if (isPublicApiRoute(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get('auth-token')?.value ||
                 request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-email', user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const token = request.cookies.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;

  if (isPublicRoute(pathname)) {
    if (user && (pathname === '/login' || pathname === '/register')) {
      const redirectUrl = getRedirectUrl(user.role);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('redirect-after-login', pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  if (!hasRequiredRole(user.role, pathname)) {
    const redirectUrl = getRedirectUrl(user.role);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-email', user.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export function getUserFromHeaders(headers: Headers): UserPayload | null {
  const userId = headers.get('x-user-id');
  const userRole = headers.get('x-user-role');
  const userEmail = headers.get('x-user-email');

  if (!userId || !userRole || !userEmail) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole as UserPayload['role'],
  };
}

export function getServerUser(request: Request): UserPayload | null {
  return getUserFromHeaders(new Headers(request.headers));
}