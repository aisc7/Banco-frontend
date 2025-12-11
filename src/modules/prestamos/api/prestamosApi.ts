// Banco-frontend/src/modules/prestamos/api/prestamosApi.ts
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

// Solicitudes de refinanciación (para listados, etc.)
export interface SolicitudRefinanciacion {
  id_solicitud_refinanciacion: number;
  id_prestamo: number;
  id_prestatario: number;
  estado: string; // PENDIENTE | APROBADA | RECHAZADA
  nro_cuotas: number;
  fecha_realizacion: string;
  fecha_decision?: string | null;
  comentario_cliente?: string | null;
  comentario_empleado?: string | null;
  id_empleado_decisor?: number | null;
  [key: string]: any;
}

export interface SolicitudRefinanciacionResult {
  id_solicitud_refinanciacion: number;
  estado?: string;
}

/* ============================================================================
 *  PRÉSTAMOS
 * ============================================================================
 */

/**
 * GET /api/prestamos
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
 */
export async function getPrestamosPorPrestatario(
  ci: number | string
): Promise<{
  prestatario: PrestamosPorPrestatarioResult['prestatario'];
  prestamos: Prestamo[];
  cuotas: CuotaResumen[];
}> {
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
 * GET /api/prestamos/mis-prestamos
 */
export async function getMisPrestamos(): Promise<{ prestamos: Prestamo[]; cuotas: CuotaResumen[] }> {
  const response = await httpClient.get<ApiResponse<PrestamosPorPrestatarioResult>>(
    '/api/prestamos/mis-prestamos'
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener mis préstamos');
  }
  const { prestamos = [], cuotas = [] } = (response.data.result as any) || {};
  return {
    // Por seguridad en frontend, excluimos explícitamente préstamos CANCELADO
    prestamos: mapPrestamosFromApi(prestamos).filter((p) => p.estado !== 'CANCELADO'),
    cuotas: mapCuotasResumenFromApi(cuotas)
  };
}

/**
 * POST /api/prestamos
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
 */
export async function updatePrestamo(
  idPrestamo: number,
  payload: UpdatePrestamoDto
): Promise<Prestamo> {
  const response = await httpClient.put<ApiResponse<any>>(`/api/prestamos/${idPrestamo}`, payload);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al actualizar préstamo');
  }
  return mapPrestamoFromApi(response.data.result);
}

/**
 * DELETE /api/prestamos/:idPrestamo
 */
export async function deletePrestamo(idPrestamo: number): Promise<void> {
  const response = await httpClient.delete<
    ApiResponse<{ id_prestamo: number; estado: string }>
  >(`/api/prestamos/${idPrestamo}`);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al cancelar préstamo');
  }
}

/**
 * (Antiguo flujo directo) POST /api/prestamos/:idPrestamo/refinanciaciones
 * Lo dejamos por si se usa internamente, pero el nuevo flujo va por solicitudes.
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

/* ============================================================================
 *  NUEVA LÓGICA: SOLICITUDES DE REFINANCIACIÓN
 * ============================================================================
 */

/**
 * POST /api/refinanciaciones/solicitudes
 *
 * Cuerpo:
 *  - id_prestamo: number
 *  - nuevo_nro_cuotas: number
 */
export async function createSolicitudRefinanciacion(
  idPrestamo: number,
  nuevoNroCuotas: number
): Promise<SolicitudRefinanciacionResult> {
  const response =
    await httpClient.post<ApiResponse<SolicitudRefinanciacionResult>>(
      '/api/refinanciaciones/solicitudes',
      {
        id_prestamo: idPrestamo,
        nuevo_nro_cuotas: nuevoNroCuotas
      }
    );

  if (!response.data.ok) {
    throw new Error(
      response.data.error ||
        'Error al registrar solicitud de refinanciación'
    );
  }

  return response.data.result;
}

/**
 * GET /api/refinanciaciones/solicitudes/mis-solicitudes
 */
export async function getMisSolicitudesRefinanciacion(): Promise<
  SolicitudRefinanciacion[]
> {
  const response = await httpClient.get<
    ApiResponse<SolicitudRefinanciacion[]>
  >('/api/refinanciaciones/solicitudes/mis-solicitudes');

  if (!response.data.ok) {
    throw new Error(
      response.data.error ||
        'Error al obtener tus solicitudes de refinanciación'
    );
  }

  return response.data.result;
}

/**
 * GET /api/refinanciaciones/solicitudes?estado=
 */
export async function getSolicitudesRefinanciacion(
  estado?: string
): Promise<SolicitudRefinanciacion[]> {
  const params: Record<string, string> = {};
  if (estado) {
    params.estado = estado;
  }

  const response = await httpClient.get<
    ApiResponse<SolicitudRefinanciacion[]
  >>('/api/refinanciaciones/solicitudes', { params });

  if (!response.data.ok) {
    throw new Error(
      response.data.error ||
        'Error al obtener las solicitudes de refinanciación'
    );
  }

  return response.data.result;
}

/**
 * PUT /api/refinanciaciones/solicitudes/:id/aprobar
 */
export async function aprobarSolicitudRefinanciacion(
  idSolicitud: number,
  comentarioEmpleado?: string
): Promise<any> {
  const response = await httpClient.put<ApiResponse<any>>(
    `/api/refinanciaciones/solicitudes/${idSolicitud}/aprobar`,
    comentarioEmpleado ? { comentario_empleado: comentarioEmpleado } : {}
  );

  if (!response.data.ok) {
    throw new Error(
      response.data.error ||
        'Error al aprobar la solicitud de refinanciación'
    );
  }

  return response.data.result;
}

/**
 * PUT /api/refinanciaciones/solicitudes/:id/rechazar
 */
export async function rechazarSolicitudRefinanciacion(
  idSolicitud: number,
  comentarioEmpleado?: string
): Promise<any> {
  const response = await httpClient.put<ApiResponse<any>>(
    `/api/refinanciaciones/solicitudes/${idSolicitud}/rechazar`,
    comentarioEmpleado ? { comentario_empleado: comentarioEmpleado } : {}
  );

  if (!response.data.ok) {
    throw new Error(
      response.data.error ||
        'Error al rechazar la solicitud de refinanciación'
    );
  }

  return response.data.result;
}
