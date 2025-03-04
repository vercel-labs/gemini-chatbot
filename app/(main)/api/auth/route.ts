// app/api/auth/route.ts
import { cookies } from 'next/headers';

import getFirebaseAppServerSide from '../../../../lib/firebase/get-firebase-app-server-side';

const { auth } = getFirebaseAppServerSide();

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return Response.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify the ID token (optional, but highly recommended)
    const x = await auth.verifyIdToken(idToken);

    const cookiesStore = await cookies();

    // Set the authentication cookie
    cookiesStore.set('token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
    });

    return Response.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function PUT() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function DELETE() {
  return new Response('Method Not Allowed', { status: 405 });
}
