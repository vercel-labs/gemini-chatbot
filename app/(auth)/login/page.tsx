'use client'


import { Label } from '@radix-ui/react-label';
import { Button, Flex } from '@radix-ui/themes';
import { useState } from 'react';


import { signInWithEmailAndPasswordFunc, createUserWithEmailAndPasswordFunc, signInWithGoogle, signOutUser, sendPasswordResetEmailFunc } from '../../../lib/firebase/firebase';



export default function Login() {
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
	const [ isCreatingAccount, setIsCreatingAccount ] = useState( false );
	  const [resetPasswordEmail, setResetPasswordEmail] = useState(''); // new state
  const [resetPasswordSent, setResetPasswordSent] = useState(false); //new state
  const [resetPasswordError, setResetPasswordError] = useState(''); //new state


    const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const user = await signInWithEmailAndPasswordFunc(email, password);
        setUser(user);
        setEmail('');
        setPassword('');

      } catch (error) {
        console.error('Email/password login failed:', error);
        // Handle error appropriately (e.g., display an error message to the user)
      }
    };

    const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const user = await createUserWithEmailAndPasswordFunc(email, password);
        setUser(user);
        setEmail('');
        setPassword('');
      } catch (error) {
        console.error('Email/password sign-up failed:', error);
        // Handle error appropriately
      }
    };

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

	  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const success = await sendPasswordResetEmailFunc(resetPasswordEmail);
      if (success) {
        setResetPasswordSent(true);
        setResetPasswordError('');
      } else {
        setResetPasswordSent(false);
        setResetPasswordError('Error sending password reset email.  Check your email address.');
      }
    } catch (error) {
      setResetPasswordSent(false);
      setResetPasswordError('Error sending password reset email.  Please try again.');
      console.error('Password reset failed:', error);
    }
  };

    return (
      <Flex direction="column" gap={2} align="center">
        {user ? (
            <>
            <p>Welcome, {user.displayName}! (UID: {user.uid})</p>
            <button onClick={handleSignOut}>Sign Out</button>
            </>
        ) : (
                <>
          <form onSubmit={handleEmailLogin}>
            <Label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Label>
            <br />
            <Label>
              Password:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Label>
            <br />
            <Button type="submit">Log In</Button> {/* Radix Button */}
          </form>
          <br />
          <Button onClick={()=>setIsCreatingAccount(!isCreatingAccount)}>Create Account</Button> {/* Radix Button */}
          {isCreatingAccount && (
            <form onSubmit={handleEmailSignUp}>
              <Button type="submit">Sign Up</Button> {/* Radix Button */}
            </form>
          )}
          <br />
							<Button onClick={ handleGoogleSignIn }>Sign in with Google</Button>
							<br />
							      <button onClick={()=>setResetPasswordSent(false)}>Forgot Password</button> {/* added */}
      {resetPasswordSent && <p style={{color: 'green'}}>Password reset email sent successfully!</p>}
      {resetPasswordError && <p style={{color: 'red'}}>{resetPasswordError}</p>}
      {resetPasswordSent===false &&(
        <form onSubmit={handleResetPassword}>
            <input type="email" value={resetPasswordEmail} onChange={(e) => setResetPasswordEmail(e.target.value)} placeholder="Enter your email"/>
            <button type="submit">Reset Password</button>
        </form>
      )}
        </>
        )}
      </Flex>
    );
  }
