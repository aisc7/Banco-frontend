import { httpClient } from '../../../shared/api/httpClient';
import { Solicitud, SolicitudEstado, mapSolicitudFromApi, mapSolicitudesFromApi } from '../domain/solicitud.model';

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error?: string;
}

export interface CreateSolicitudDto {
  monto: number;
  nro_cuotas: number;
  id_empleado?: number | null;
}

export interface SolicitudesQueryParams {
  estado?: SolicitudEstado | '';
  id_prestatario?: number | string;
}

/**
 * GET /api/solicitudes/mis-solicitudes
 * Descripción: Lista las solicitudes de préstamo del prestatario autenticado (rol PRESTATARIO).
 * Respuesta esperada:
 * - ok: true
 * - result: Array de solicitudes de préstamo.
 */
export async function getMisSolicitudes(): Promise<Solicitud[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/solicitudes/mis-solicitudes');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener solicitudes del prestatario');
  }
  return mapSolicitudesFromApi(response.data.result);
}

/**
 * POST /api/solicitudes
 * Descripción: Crea una nueva solicitud de préstamo.
 * - Si el usuario autenticado es PRESTATARIO, el backend fuerza id_prestatario desde el token.
 * Cuerpo esperado:
 * - monto: number
 * - nro_cuotas: number
 * - id_empleado?: number
 * Respuesta esperada:
 * - ok: true
 * - result: { id_solicitud_prestamo, estado: 'PENDIENTE' }
 */
export async function createSolicitud(payload: CreateSolicitudDto): Promise<{ id_solicitud_prestamo: number; estado: SolicitudEstado }> {
  const response = await httpClient.post<ApiResponse<{ id_solicitud_prestamo: number; estado: SolicitudEstado }>>(
    '/api/solicitudes',
    payload
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al crear solicitud de préstamo');
  }
  return response.data.result;
}

/**
 * GET /api/solicitudes?estado=&id_prestatario=
 * Descripción: Lista solicitudes de préstamo (solo empleados), con filtros opcionales por estado e id_prestatario.
 * Parámetros:
 * - estado?: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'
 * - id_prestatario?: number
 * Respuesta esperada:
 * - ok: true
 * - result: Array de solicitudes.
 */
export async function getSolicitudes(params: SolicitudesQueryParams = {}): Promise<Solicitud[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/solicitudes', {
    params: {
      estado: params.estado || undefined,
      id_prestatario: params.id_prestatario || undefined
    }
  });
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al listar solicitudes');
  }
  return mapSolicitudesFromApi(response.data.result);
}

/**
 * PUT /api/solicitudes/:id/aprobar
 * Descripción: Aprueba una solicitud de préstamo y crea el préstamo y sus cuotas en una única transacción.
 * Respuesta esperada:
 * - ok: true
 * - result: { solicitud: { id_solicitud, estado }, prestamo: { id_prestamo } }
 */
export async function aprobarSolicitud(id: number): Promise<{ solicitud: { id_solicitud: number; estado: SolicitudEstado }; prestamo: { id_prestamo: number } }> {
  const response = await httpClient.put<ApiResponse<{ solicitud: { id_solicitud: number; estado: SolicitudEstado }; prestamo: { id_prestamo: number } }>>(
    `/api/solicitudes/${id}/aprobar`,
    {}
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al aprobar solicitud');
  }
  return response.data.result;
}

/**
 * PUT /api/solicitudes/:id/rechazar
 * Descripción: Rechaza una solicitud de préstamo, opcionalmente con motivo.
 * Cuerpo esperado:
 * - motivo?: string
 * Respuesta esperada:
 * - ok: true
 * - result: { solicitud: { id_solicitud, estado: 'RECHAZADA', motivo? } }
 */
export async function rechazarSolicitud(
  id: number,
  motivo?: string
): Promise<{ solicitud: { id_solicitud: number; estado: 'RECHAZADA'; motivo?: string | null } }> {
  const response = await httpClient.put<ApiResponse<{ solicitud: { id_solicitud: number; estado: 'RECHAZADA'; motivo?: string | null } }>>(
    `/api/solicitudes/${id}/rechazar`,
    motivo ? { motivo } : {}
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al rechazar solicitud');
  }
  return response.data.result;
}

