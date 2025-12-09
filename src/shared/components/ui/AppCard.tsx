import React from 'react';
import { Card, CardContent, CardProps } from '@mui/material';

export interface AppCardProps extends CardProps {
  children: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({ children, ...rest }) => {
  return (
    <Card {...rest}>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

