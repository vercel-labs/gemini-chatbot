'use client';
import { Box, Button, Container } from '@radix-ui/themes';
import { useAuthState } from 'react-firebase-hooks/auth';

import {
  getFirebaseAppClientSide,
  signOutUser,
} from '../lib/firebase/firebase';

const LoginStatus = () => {
  const { authInstance } = getFirebaseAppClientSide();
  const [user, error] = useAuthState(authInstance);

  console.log('user');
  return (
    <div className="p-4">
      {user && <Box>USER: {user?.displayName}</Box>}
      {error && <Box>ERROR: {error}</Box>}
      <Container>
        <Button onClick={signOutUser}>Log out</Button>
      </Container>
    </div>
  );
};

export default LoginStatus;
