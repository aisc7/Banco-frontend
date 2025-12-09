import { httpClient } from '../../../shared/api/httpClient';
import { ReporteRow, mapReportesFromApi } from '../domain/reporte.model';

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error?: string;
}

/**
 * GET /api/reportes/prestamos
 * Descripción: Obtiene un resumen consolidado de préstamos.
 * Respuesta esperada:
 * - ok: true
 * - result: array de filas (campos definidos en PAK_REPORTES.FUN_RESUMEN_PRESTAMOS)
 */
export async function getResumenPrestamos(): Promise<ReporteRow[]> {
  const response = await httpClient.get<ApiResponse<ReporteRow[]>>('/api/reportes/prestamos');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener resumen de préstamos');
  }
  return mapReportesFromApi(response.data.result as any[]);
}

/**
 * GET /api/reportes/morosos
 * Descripción: Obtiene un listado de prestatarios/ préstamos morosos.
 * Respuesta esperada:
 * - ok: true
 * - result: array de filas (estructura según función FUN_LISTADO_MOROSOS)
 */
export async function getMorosos(): Promise<ReporteRow[]> {
  const response = await httpClient.get<ApiResponse<ReporteRow[]>>('/api/reportes/morosos');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener reporte de morosos');
  }
  return mapReportesFromApi(response.data.result as any[]);
}

/**
 * GET /api/reportes/refinanciaciones
 * Descripción: Obtiene un listado de refinanciaciones activas.
 * Respuesta esperada:
 * - ok: true
 * - result: array de filas (estructura según FUN_REFINANCIACIONES_ACTIVAS)
 */
export async function getRefinanciaciones(): Promise<ReporteRow[]> {
  const response = await httpClient.get<ApiResponse<ReporteRow[]>>('/api/reportes/refinanciaciones');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener refinanciaciones');
  }
  return mapReportesFromApi(response.data.result as any[]);
}
