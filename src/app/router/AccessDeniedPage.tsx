import React from 'react';
import { Box, Typography } from '@mui/material';

export const AccessDeniedPage: React.FC = () => {
  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h4" gutterBottom>
        Acceso denegado
      </Typography>
      <Typography variant="body1">
        No tienes permisos para acceder a este recurso.
      </Typography>
    </Box>
  );
};

