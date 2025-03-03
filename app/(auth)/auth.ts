import { getAuth, GoogleAuthProvider } from '@firebase/auth';
import { initializeApp } from 'firebase/app';
import NextAuth from "next-auth";
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from "./auth.config";
import { firebaseConfig, signInWithEmailAndPasswordFunc } from '../../lib/firebase/firebase';

export const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app); // Get the authentication instance


export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
  ],

  callbacks: {
    async session({ session, token }) {
			session.user = token.user as any

			console.log('auth',session, token)

        return session
    },
    // async jwt({ token, user }) {
    //   if (user) {
    //     token.user = user;
    //     const userData = await fetchUserData(user.uid);
    //     token.role = userData?.role || "user";
    //     token.company = userData?.company;
    //   }
    //   return token;
    // },
  },
});

