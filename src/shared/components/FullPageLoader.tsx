import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const FullPageLoader: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CircularProgress />
    </Box>
  );
};

