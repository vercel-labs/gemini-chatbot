'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/db/queries';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    let [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    } else {
      await createUser(validatedData.email, validatedData.password);
      await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      return { status: 'success' };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

// server actions with auth checks

// // actions/authActions.ts
// 'use server';

// import { getAuth } from 'firebase-admin/auth';
// import { getAppCheck } from 'firebase-admin/app-check';
// import { initializeApp, cert, App } from 'firebase-admin/app';

// let firebaseApp: App | null = null;
// const serviceAccount = JSON.parse(
//   process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
// );

// if (!firebaseApp) {
//   firebaseApp = initializeApp({
//     credential: cert(serviceAccount),
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   });
// }
// const auth = getAuth(firebaseApp);
// const appCheck = getAppCheck(firebaseApp);

// export async function authorizeUser(idToken: string, appCheckToken: string) {
//   try {
//     await auth.verifyIdToken(idToken);
//     await appCheck.verifyToken(appCheckToken);
//     return { success: true };
//   } catch (error: any) {
//     console.error('Server action authorization error:', error);
//     return { success: false, error: error.message };
//   }
// }

// //Example server action
// export async function myServerAction(formData: FormData) {
//   const idToken = formData.get('idToken') as string;
//   const appCheckToken = formData.get('appCheckToken') as string;

//   const authResult = await authorizeUser(idToken, appCheckToken);

//   if (!authResult.success) {
//     return { error: authResult.error };
//   }

//   // Your server action logic here
//   return { message: 'Server action successful' };
// }

// action use with auth in client
// components/ProtectedComponent.tsx
// 'use client';

// import { useState } from 'react';
// import { myServerAction } from '../actions/authActions';

// const ProtectedComponent = () => {
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleAction = async () => {
//     const idToken = localStorage.getItem('idToken'); // Or wherever you store the token
//     const appCheckToken = localStorage.getItem('appCheckToken'); // Or wherever you store the token

//     if (!idToken || !appCheckToken) {
//       setError('Tokens missing');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('idToken', idToken);
//     formData.append('appCheckToken', appCheckToken);

//     const result = await myServerAction(formData);

//     if (result.error) {
//       setError(result.error);
//       setMessage('');
//     } else {
//       setMessage(result.message);
//       setError('');
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleAction}>Run Server Action</button>
//       {message && <p>{message}</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//     </div>
//   );
// };

// export default ProtectedComponent;
