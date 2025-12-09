import { useState } from 'react';

export interface ConfirmationDialogState {
  open: boolean;
  message: string;
}

export interface UseConfirmationDialogResult {
  open: boolean;
  message: string;
  ask: (message: string, onConfirm: () => void) => void;
  confirm: () => void;
  cancel: () => void;
}

export function useConfirmationDialog(): UseConfirmationDialogResult {
  const [state, setState] = useState<ConfirmationDialogState>({ open: false, message: '' });
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const ask = (message: string, cb: () => void) => {
    setState({ open: true, message });
    setOnConfirm(() => cb);
  };

  const confirm = () => {
    if (onConfirm) onConfirm();
    setState({ open: false, message: '' });
    setOnConfirm(null);
  };

  const cancel = () => {
    setState({ open: false, message: '' });
    setOnConfirm(null);
  };

  return { open: state.open, message: state.message, ask, confirm, cancel };
}

