import { Box } from 'lucide-react';

const LoginStatus = () => {
  return (
    <div className="p-4">
      <Box>USER: {error ?? user ? user : 'Not logged in'}</Box>
    </div>
  );
};
