'use client';
import { Box, Button, Container } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';

import {
  getFirebaseAppClientSide,
  signOutUser,
} from '../lib/firebase/firebase';

const LoginStatus = () => {
  const { authInstance } = getFirebaseAppClientSide();
  const [user, error] = useAuthState(authInstance);
  const router = useRouter();

  const handleLogout = async () => {
    signOutUser();
    router.push('/');
  };

  console.log('user');
  return (
    <div className="p-4">
      {user && (
        <Container>
          <Box>USER: {user?.displayName}</Box>
          <Button onClick={handleLogout}>Log out</Button>
        </Container>
      )}
      {error && <Box>ERROR: {error}</Box>}
    </div>
  );
};

export default LoginStatus;
