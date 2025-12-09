import { httpClient } from '../../../shared/api/httpClient';
import {
  Notificacion,
  mapNotificacionesFromApi,
  mapNotificacionFromApi
} from '../domain/notificacion.model';

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error?: string;
}

/**
 * GET /api/notificaciones/pendientes
 * Descripción: Lista notificaciones pendientes de envío (enviado = 'N').
 * Respuesta esperada:
 * - ok: true
 * - result: Notificacion[]
 */
export async function getNotificacionesPendientes(): Promise<Notificacion[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/notificaciones/pendientes');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener notificaciones pendientes');
  }
  const mapped = mapNotificacionesFromApi(response.data.result);
  // Forzamos enviado = 'N' para esta vista específica.
  return mapped.map((n) => ({ ...n, enviado: 'N' }));
}

/**
 * GET /api/notificaciones
 * Descripción: Lista histórico de notificaciones (todas, con estado enviado).
 * Respuesta esperada:
 * - ok: true
 * - result: Notificacion[]
 */
export async function getNotificacionesHistorico(): Promise<Notificacion[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/notificaciones');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener histórico de notificaciones');
  }
  return mapNotificacionesFromApi(response.data.result);
}

/**
 * POST /api/notificaciones/enviar
 * Descripción: Marca notificaciones como enviadas de forma masiva por tipo.
 * Cuerpo esperado:
 * - tipo: 'PAGO' | 'MORA' | 'CANCELACION'
 * Respuesta esperada:
 * - ok: true
 * - result: { tipo, enviado: true }
 */
export async function enviarNotificacionesMasivas(tipo: string): Promise<void> {
  const response = await httpClient.post<ApiResponse<{ tipo: string; enviado: boolean }>>(
    '/api/notificaciones/enviar',
    { tipo }
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al enviar notificaciones');
  }
}

/**
 * POST /api/notificaciones/recordatorios-pago
 * Descripción: Ejecuta procedimiento para generar recordatorios de pago.
 */
export async function generarRecordatoriosPago(): Promise<void> {
  const response = await httpClient.post<ApiResponse<{ ok: boolean }>>(
    '/api/notificaciones/recordatorios-pago',
    {}
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al generar recordatorios de pago');
  }
}

/**
 * POST /api/notificaciones/notificar-mora
 * Descripción: Ejecuta procedimiento para generar notificaciones de mora.
 */
export async function generarNotificacionesMora(): Promise<void> {
  const response = await httpClient.post<ApiResponse<{ ok: boolean }>>(
    '/api/notificaciones/notificar-mora',
    {}
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al generar notificaciones de mora');
  }
}

/**
 * POST /api/notificaciones/notificar-cancelacion
 * Descripción: Ejecuta procedimiento para generar notificaciones de cancelación de préstamos.
 */
export async function generarNotificacionesCancelacion(): Promise<void> {
  const response = await httpClient.post<ApiResponse<{ ok: boolean }>>(
    '/api/notificaciones/notificar-cancelacion',
    {}
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al generar notificaciones de cancelación');
  }
}
