import { httpClient } from '../../../shared/api/httpClient';
import { Cuota, mapCuotasFromApi } from '../domain/cuota.model';

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error?: string;
}

export interface RegistrarPagoCuotaDto {
  fecha_pago?: string;
  monto_pagado?: number;
  metodo?: string;
}

export interface RegistrarPagoCuotaResult {
  cuota: any | null;
  prestamo: any | null;
}

export interface EstadoMorosoResult {
  id_prestatario: number;
  vencidasImpagas: number;
  estado: 'MOROSO' | 'ACTIVO';
}

/**
 * GET /api/cuotas/pendientes
 * Descripción: Lista cuotas pendientes (vista VW_CUOTAS_PENDIENTES).
 * Respuesta esperada:
 * - ok: true
 * - result: array de cuotas
 */
export async function getCuotasPendientes(): Promise<Cuota[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/cuotas/pendientes');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener cuotas pendientes');
  }
  return mapCuotasFromApi(response.data.result);
}

/**
 * GET /api/cuotas/morosas
 * Descripción: Lista cuotas morosas (vista VW_CUOTAS_MOROSAS).
 * Respuesta esperada:
 * - ok: true
 * - result: array de cuotas
 */
export async function getCuotasMorosas(): Promise<Cuota[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/cuotas/morosas');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener cuotas morosas');
  }
  return mapCuotasFromApi(response.data.result);
}

/**
 * POST /api/cuotas/:idCuota/pagar
 * Descripción: Registra el pago de una cuota.
 * Cuerpo esperado:
 * - fecha_pago?: string (ISO o YYYY-MM-DD)
 * - monto_pagado?: number
 * - metodo?: string
 * Respuesta esperada:
 * - ok: true
 * - result: { cuota, prestamo }
 */
export async function registrarPagoCuota(
  idCuota: number,
  payload: RegistrarPagoCuotaDto
): Promise<RegistrarPagoCuotaResult> {
  const response = await httpClient.post<ApiResponse<RegistrarPagoCuotaResult>>(
    `/api/cuotas/${idCuota}/pagar`,
    payload
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al registrar pago de cuota');
  }
  return response.data.result;
}

/**
 * GET /api/cuotas/prestatarios/:id/estado-moroso
 * Descripción: Obtiene el estado de morosidad derivado de un prestatario.
 * Respuesta esperada:
 * - ok: true
 * - result: { id_prestatario, vencidasImpagas, estado }
 */
export async function getEstadoMorosoPrestatario(idPrestatario: number): Promise<EstadoMorosoResult> {
  const response = await httpClient.get<ApiResponse<EstadoMorosoResult>>(
    `/api/cuotas/prestatarios/${idPrestatario}/estado-moroso`
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener estado moroso del prestatario');
  }
  return response.data.result;
}
