import { initializeApp } from 'firebase-admin';
import { App, cert } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}',
);

const getFirebaseAppServerSide = (): { firebaseApp: App; auth: Auth } => {
  // Initialize Firebase Admin SDK ONLY ONCE at the top level of your api route
  let firebaseApp: App | null = null;

  if (!firebaseApp) {
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Make sure this is also set in environment variables.
    });
  }

  const auth = getAuth(firebaseApp);

  return { firebaseApp, auth };
};

export default getFirebaseAppServerSide;
