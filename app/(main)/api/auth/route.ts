// app/api/login/route.ts
import { cookies } from 'next/headers';

import getFirebaseAppServerSide from '../../../../lib/firebase/get-firebase-app-server-side';

const { auth } = getFirebaseAppServerSide();

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    console.log(idToken, 'idToken');

    if (!idToken) {
      return Response.json({ error: 'ID token is required' }, { status: 400 });
    }

    const x = await auth.verifyIdToken(idToken);

    const cookieStore = await cookies();

    cookieStore.set('token', idToken, {
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

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    return Response.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json({ error: 'Logout failed' }, { status: 500 });
  }
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function PUT() {
  return new Response('Method Not Allowed', { status: 405 });
}
