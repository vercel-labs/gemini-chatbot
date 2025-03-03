// middleware.ts
import { getAppCheck } from 'firebase-admin/app-check';
import { NextResponse } from 'next/server';

import getFirebaseAppServerSide from './lib/firebase/get-firebase-app-server-side';

import type { NextRequest } from 'next/server';

const { firebaseApp, auth } = getFirebaseAppServerSide();
const appCheck = getAppCheck(firebaseApp);

export async function middleware(req: NextRequest) {
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
};
