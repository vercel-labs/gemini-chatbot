import { FirebaseAdapter } from "@next-auth/firebase-adapter";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication functions
import { NextAuthConfig } from "next-auth";


export const authConfig: NextAuthConfig = {

  pages: {
    signIn: "/login",
    //newUser: "/", //Consider removing this if Firebase handles user creation
  },
  providers: [], //Providers will be added dynamically in auth.ts
  // callbacks: {
	// 	authorized: async ( { auth, request: { nextUrl } } ) => {
  //     const isLoggedIn = !!auth?.user;
  //     const isOnLogin = nextUrl.pathname.startsWith("/login");
  //     const isOnRegister = nextUrl.pathname.startsWith("/register"); //Handle registration differently (optional)
  //     const isOnProtectedRoute = nextUrl.pathname.startsWith("/"); //Path to protected routes

  //     if (isLoggedIn && (isOnLogin || isOnRegister)) {
  //       return Response.redirect(new URL("/", nextUrl));
  //     }
  //     if (!isLoggedIn && isOnProtectedRoute) {
  //       return Response.redirect(new URL("/login", nextUrl));
  //     }

  //     //Handle other routes as needed

  //     return true;
  //   },
  // },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
};
