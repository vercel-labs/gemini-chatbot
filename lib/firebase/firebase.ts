// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// Import other Firebase services as needed (Firestore, etc.)


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Get the authentication instance

// Example: Google Sign-In Provider (add more providers as needed)
export const googleProvider = new GoogleAuthProvider();


// Example functions (move these to a more appropriate location in your app)
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Signed in with Google:", user);
    // Handle successful sign-in
    // Redirect to a protected route or update UI
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    // Handle sign-in error
    throw error;
  }
}


export async function signOutUser() {
    try {
        await signOut(auth);
        console.log("Signed out successfully!");
        // Handle successful sign-out, e.g., redirect to login page
    } catch (error) {
        console.error("Sign-out error:", error);
        // Handle sign-out error
    }
}


