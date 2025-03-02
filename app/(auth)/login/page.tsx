// pages/login.tsx
'use client';
import { useState } from 'react';

import { signInWithGoogle, signOutUser } from '../../../lib/firebase/firebase';


export default function Login() {
  const [user, setUser] = useState<any>(null);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
        await signOutUser();
        setUser(null);
    } catch (error) {
        console.error("Sign-out failed:", error);
    }
  };


  return (
    <div>
      {user ? (
          <>
          <p>Welcome, {user.displayName}! (UID: {user.uid})</p>
          <button onClick={handleSignOut}>Sign Out</button>
          </>
      ) : (
        <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      )}
    </div>
  );
}
