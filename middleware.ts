// middleware.ts
import { getAppCheck } from 'firebase-admin/app-check';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import getFirebaseAppServerSide from './lib/firebase/get-firebase-app-server-side';

const { auth, firebaseApp } = getFirebaseAppServerSide();

const appCheck = firebaseApp ? getAppCheck(firebaseApp) : null;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  console.log('url', url);
  const publicPaths = ['/login', '/', '/demo', '/api/auth'];

  if (publicPaths.some((path) => url === path)) {
    return NextResponse.next();
  }

  try {
    const cookieStore = await cookies(); // Use cookies() directly
    const idToken = cookieStore.get('token')?.value;

    console.log(cookieStore.get('token')?.value);
    console.log('token from cookie', idToken);

    if (!idToken) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verification = await auth.verifyIdToken(idToken);
    console.log('verification', verification);

    return NextResponse.next(); // User is authorized, cookies are already set.
  } catch (error: any) {
    console.error('Middleware authorization error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};
