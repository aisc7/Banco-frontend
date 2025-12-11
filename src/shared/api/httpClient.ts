import axios from 'axios';
import { useAuthStore } from '../../modules/auth/store/useAuthStore';
import { useNotificationStore } from '../../app/store/useNotificationStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Mapea un mensaje de error crudo del backend a un texto amigable para el usuario final.
 * Los detalles técnicos (ej. códigos ORA-xxxx) solo deben verse en consola, nunca en la UI.
 */
function mapBackendErrorToUserMessage(rawMessage: unknown): string {
  if (!rawMessage) {
    return 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.';
  }

  const msg = String(rawMessage);

  // Normalizar para comparaciones simples (sin acentos)
  const normalized = msg
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Caso específico: máximo 2 préstamos activos (mensaje PL/SQL ORA-20001)
  if (msg.includes('ORA-20001') && normalized.includes('2 prestamos activos')) {
    return 'No puedes crear este préstamo porque ya tienes 2 préstamos activos registrados.';
  }

  // Cualquier otro error Oracle (ORA-xxxx) → mensaje genérico para el usuario
  if (msg.includes('ORA-')) {
    return 'Ocurrió un error en el sistema al procesar tu solicitud. Intenta nuevamente o comunícate con soporte.';
  }

  // Si el backend ya envía mensajes legibles, se reutilizan tal cual
  return msg;
}

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
    const backendMessage: string =
      (data && (data.message || data.error)) ||
      error.message ||
      'Error inesperado en la solicitud';
    const backendDetail: string | undefined = data && data.detail ? String(data.detail) : undefined;

    const userMessage = mapBackendErrorToUserMessage(backendMessage);

    // Log completo solo en consola para diagnóstico (incluye ORA-xxxx y detail si aplica)
    // eslint-disable-next-line no-console
    console.error(
      '[httpClient] Error en llamada a la API:',
      backendMessage,
      backendDetail ? `| detail: ${backendDetail}` : ''
    );

    // Normalizar mensaje de error para que stores y formularios reciban un texto amigable
    // eslint-disable-next-line no-param-reassign
    error.message = userMessage;

    const { enqueue } = useNotificationStore.getState();
    enqueue(userMessage, 'error');

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
