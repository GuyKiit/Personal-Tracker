import { ReactNode } from 'react';
import Navbar from './components/Navbar';
import Box from '@mui/material/Box';

interface MasterLayoutProps {
  children: ReactNode;
}

export default function MasterLayout({ children }: MasterLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', background: '#0f0f23' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          pt: '80px',
          px: { xs: 2, sm: 3, md: 4 },
          pb: 4,
          maxWidth: 1400,
          mx: 'auto',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
