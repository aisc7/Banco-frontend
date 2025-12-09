import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useNotificationStore } from '../store/useNotificationStore';

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const queue = useNotificationStore((s) => s.queue);
  const remove = useNotificationStore((s) => s.remove);

  const current = queue[0];

  const handleClose = () => {
    if (current) {
      remove(current.id);
    }
  };

  return (
    <>
      {children}
      {current && (
        <Snackbar
          open
          autoHideDuration={5000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleClose} severity={current.severity} variant="filled">
            {current.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

