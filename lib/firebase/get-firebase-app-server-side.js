const path = require('path');

const admin = require('firebase-admin');

const getFirebaseAppServerSide = () => {
  // Initialize Firebase Admin SDK ONLY ONCE at the top level of your api route
  let firebaseApp = null;

  const serviceAccountPath = path.resolve(
    './lib/firebase/google-service-account.json',
  );

  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
  } else {
    firebaseApp = admin.apps[0];
  }

  const auth = admin.auth(firebaseApp);

  return { firebaseApp, auth: auth };
};

module.exports = getFirebaseAppServerSide;
