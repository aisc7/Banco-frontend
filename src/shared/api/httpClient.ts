import axios from 'axios';
import { useAuthStore } from '../../modules/auth/store/useAuthStore';
import { useNotificationStore } from '../../app/store/useNotificationStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const httpClient = axios.create({
  baseURL,
  timeout: 15000
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const data = error.response?.data;
    const message: string =
      (data && (data.message || data.error)) ||
      error.message ||
      'Error inesperado en la solicitud';

    // Normalizar mensaje de error para que stores y formularios reciban el texto de negocio del backend
    // (por ejemplo: "El prestatario ya tiene 2 préstamos activos").
    // Regla de negocio: reutilizar el mismo mensaje en snackbar y en UI local.
    // eslint-disable-next-line no-param-reassign
    error.message = message;

    const { enqueue } = useNotificationStore.getState();
    enqueue(message, 'error');

    if (status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/acceso-denegado';
      }
    }

    return Promise.reject(error);
  }
);
