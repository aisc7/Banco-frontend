
export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface CustomToast {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

/**
 * Hook de toast muy sencillo.
 * Ahora mismo:
 *  - Muestra alert() en pantalla
 *  - Escribe en consola con el tipo de mensaje
 *
 * Si luego quieres, aquí puedes integrar react-toastify, Snackbar de MUI, etc.
 */
export default function useCustomToast(): CustomToast {
  const show = (message: string, variant: ToastVariant = 'info') => {
    // Log en consola (útil en desarrollo)
    // eslint-disable-next-line no-console
    console.log(`[${variant.toUpperCase()}] ${message}`);
    // Aviso básico en UI
    window.alert(message);
  };

  const showSuccess = (message: string) => show(message, 'success');
  const showError = (message: string) => show(message, 'error');
  const showInfo = (message: string) => show(message, 'info');
  const showWarning = (message: string) => show(message, 'warning');

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
