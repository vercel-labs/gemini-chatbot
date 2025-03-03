// pages/api/login.ts
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { NextApiRequest, NextApiResponse } from 'next';

import getFirebaseAppServerSide from '../../../../lib/firebase/get-firebase-app-server-side';

const { firebaseApp, auth } = getFirebaseAppServerSide();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'ID token is required' });
      }

      // Verify the ID token (optional, but highly recommended)
      await auth.verifyIdToken(idToken);

      // Set the authentication cookie
      res.setHeader('Set-Cookie', [
        `token=${idToken}; HttpOnly; Secure; SameSite=Strict; Path=/`,
      ]);

      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
