import { httpClient } from '../../../shared/api/httpClient';
import {
  Prestamo,
  CuotaResumen,
  mapPrestamoFromApi,
  mapPrestamosFromApi,
  mapCuotasResumenFromApi
} from '../domain/prestamo.model';

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error?: string;
}

export interface CreatePrestamoDto {
  id_prestatario?: number;
  monto: number;
  nro_cuotas: number;
  tipo_interes?: 'BAJA' | 'MEDIA' | 'ALTA';
  id_empleado?: number | null;
}

export interface UpdatePrestamoDto {
  estado?: string;
}

export interface PrestamosPorPrestatarioResult {
  prestatario: {
    id_prestatario: number;
    ci: number;
  } | null;
  prestamos: any[];
  cuotas: any[];
}

export interface RefinanciacionDto {
  nro_cuotas: number;
}

export interface CreatePrestamoResult {
  id_prestamo: number;
}

export interface RefinanciacionResult {
  id_solicitud_refinanciacion: number;
}

/**
 * GET /api/prestamos
 * Descripción: Lista todos los préstamos (solo rol EMPLEADO).
 * Respuesta esperada:
 * - ok: true
 * - result: Prestamo[] (campos de PRESTAMOS).
 */
export async function getPrestamos(): Promise<Prestamo[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/prestamos');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al listar préstamos');
  }
  return mapPrestamosFromApi(response.data.result);
}

/**
 * GET /api/prestamos/:idPrestamo
 * Descripción: Obtiene un préstamo por ID.
 * Respuesta esperada:
 * - ok: true
 * - result: Prestamo
 */
export async function getPrestamoById(idPrestamo: number): Promise<Prestamo> {
  const response = await httpClient.get<ApiResponse<any>>(`/api/prestamos/${idPrestamo}`);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener préstamo');
  }
  return mapPrestamoFromApi(response.data.result);
}

/**
 * GET /api/prestamos/prestatario/:ci
 * Descripción: Obtiene información de préstamos y cuotas de un prestatario por cédula.
 * Parámetros:
 * - ci: número de cédula del prestatario.
 * Respuesta esperada:
 * - ok: true
 * - result: {
 *     prestatario: { id_prestatario, ci } | null,
 *     prestamos: Prestamo[],
 *     cuotas: CuotaResumen[]
 *   }
 */
export async function getPrestamosPorPrestatario(
  ci: number | string
): Promise<{ prestatario: PrestamosPorPrestatarioResult['prestatario']; prestamos: Prestamo[]; cuotas: CuotaResumen[] }> {
  const response = await httpClient.get<ApiResponse<PrestamosPorPrestatarioResult>>(
    `/api/prestamos/prestatario/${ci}`
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener préstamos del prestatario');
  }
  const { prestatario, prestamos, cuotas } = response.data.result;
  return {
    prestatario,
    prestamos: mapPrestamosFromApi(prestamos),
    cuotas: mapCuotasResumenFromApi(cuotas)
  };
}

/**
 * POST /api/prestamos
 * Descripción: Crea un nuevo préstamo asociado a un prestatario.
 * - Si el usuario autenticado es PRESTATARIO, el backend fuerza id_prestatario = id del token.
 * Cuerpo esperado:
 * - id_prestatario: number (opcional si se infiere del token)
 * - monto: number
 * - nro_cuotas: number
 * - tipo_interes: 'BAJA' | 'MEDIA' | 'ALTA'
 * - id_empleado?: number
 * Respuesta esperada:
 * - ok: true
 * - result: { id_prestamo: number }
 */
export async function createPrestamo(payload: CreatePrestamoDto): Promise<CreatePrestamoResult> {
  const response = await httpClient.post<ApiResponse<CreatePrestamoResult>>('/api/prestamos', payload);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al crear préstamo');
  }
  return response.data.result;
}

/**
 * PUT /api/prestamos/:idPrestamo
 * Descripción: Actualiza información del préstamo (principalmente su estado).
 * Cuerpo esperado:
 * - estado?: string
 * Respuesta esperada:
 * - ok: true
 * - result: Prestamo actualizado
 */
export async function updatePrestamo(idPrestamo: number, payload: UpdatePrestamoDto): Promise<Prestamo> {
  const response = await httpClient.put<ApiResponse<any>>(`/api/prestamos/${idPrestamo}`, payload);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al actualizar préstamo');
  }
  return mapPrestamoFromApi(response.data.result);
}

/**
 * DELETE /api/prestamos/:idPrestamo
 * Descripción: Cancela un préstamo marcando su estado como 'CANCELADO'.
 * Respuesta esperada:
 * - ok: true
 * - result: { id_prestamo, estado: 'CANCELADO' }
 */
export async function deletePrestamo(idPrestamo: number): Promise<void> {
  const response = await httpClient.delete<ApiResponse<{ id_prestamo: number; estado: string }>>(
    `/api/prestamos/${idPrestamo}`
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al cancelar préstamo');
  }
}

/**
 * POST /api/prestamos/:idPrestamo/refinanciaciones
 * Descripción: Registra una refinanciación de un préstamo existente.
 * Cuerpo esperado:
 * - nro_cuotas: number
 * Respuesta esperada:
 * - ok: true
 * - result: { id_solicitud_refinanciacion: number }
 */
export async function createRefinanciacion(
  idPrestamo: number,
  payload: RefinanciacionDto
): Promise<RefinanciacionResult> {
  const response = await httpClient.post<ApiResponse<RefinanciacionResult>>(
    `/api/prestamos/${idPrestamo}/refinanciaciones`,
    payload
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al registrar refinanciación');
  }
  return response.data.result;
}
