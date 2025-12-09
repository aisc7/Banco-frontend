import React from 'react';
import { Button, ButtonProps } from '@mui/material';

export interface AppButtonProps extends ButtonProps {}

export const AppButton: React.FC<AppButtonProps> = (props) => {
  return <Button variant="contained" color="primary" {...props} />;
};

