// middleware.ts
// import { getAppCheck } from 'firebase-admin/app-check';
import { initializeApp } from 'firebase-admin';
import { App, applicationDefault, cert } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { Auth, getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

// Initialize Firebase Admin SDK ONLY ONCE at the top level of your api route
let firebaseApp: App | null = null;

if (!firebaseApp) {
  firebaseApp = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Make sure this is also set in environment variables.
  });
}

const auth = getAuth(firebaseApp);

const appCheck = getAppCheck(firebaseApp);

export async function middleware(req: NextRequest) {
  const cookieStore = await cookies();
  console.log('cookieStore', cookieStore);
  // const url = req.nextUrl.pathname;
  // const publicPaths = ['/login', '/', '/demo'];

  // if (publicPaths.some((path) => url.startsWith(path))) {
  //   return NextResponse.next();
  // }

  // try {
  //   const idToken = req.cookies.get('token')?.value;
  //   const appCheckToken = req.cookies.get('appCheckToken')?.value;

  //   if (!idToken || !appCheckToken) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  //   }

  //   await auth.verifyIdToken(idToken);
  //   await appCheck.verifyToken(appCheckToken);

  //   return NextResponse.next(); // User is authorized, cookies are already set.
  // } catch (error: any) {
  //   console.error('Middleware authorization error:', error);
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};
