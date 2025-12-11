import { httpClient } from '../../../shared/api/httpClient';

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error?: string;
}

export interface AuditoriaLog {
  ID_AUDIT_PK: number;
  USUARIO: string;
  IP: string;
  DOMINIO: string;
  FECHA_ENTRADA: string;
  FECHA_SALIDA: string | null;
  TABLA_AFECTADA: string;
  OPERACION: string;
  DURACION_SESION: string | null;
  DESCRIPCION: string;
}

export interface RegistrarAuditoriaDto {
  usuario: string;
  ip?: string;
  dominio?: string;
  tabla?: string;
  operacion?: string;
  descripcion?: string;
}

export interface RegistrarAuditoriaResult {
  id_audit: number;
}

/**
 * POST /api/auditoria/registrar
 * Descripción: Registra manualmente un evento de auditoría.
 */
export async function registrarAuditoria(
  payload: RegistrarAuditoriaDto
): Promise<RegistrarAuditoriaResult> {
  const response = await httpClient.post<ApiResponse<RegistrarAuditoriaResult>>(
    '/api/auditoria/registrar',
    payload
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al registrar auditoría');
  }
  return response.data.result;
}

/**
 * GET /api/auditoria/logs
 * Descripción: Obtiene los registros de auditoría con filtros y paginación.
 */
export async function getAuditoriaLogs(params?: {
  usuario?: string;
  operacion?: string;
  tabla?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditoriaLog[]> {
  const response = await httpClient.get<ApiResponse<AuditoriaLog[]>>('/api/auditoria/logs', {
    params: {
      ...params,
      limit: params?.limit ?? 100,
      offset: params?.offset ?? 0,
    },
  });
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener logs de auditoría');
  }
  return response.data.result;
}

/**
 * POST /api/auditoria/finalizar
 * Descripción: Finaliza una sesión de auditoría previa.
 */
export async function finalizarSesion(id_audit: number): Promise<void> {
  const response = await httpClient.post<ApiResponse<{ id_audit: number }>>(
    '/api/auditoria/finalizar',
    { id_audit }
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al finalizar sesión de auditoría');
  }
}

