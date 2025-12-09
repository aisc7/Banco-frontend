import { httpClient } from '../../../shared/api/httpClient';
import {
  Prestatario,
  PrestatariosLoadLog,
  mapPrestatarioFromApi,
  mapPrestatariosFromApi,
  mapPrestatariosLoadLogsFromApi
} from '../domain/prestatario.model';

export interface CreatePrestatarioDto {
  ci: number | string;
  nombre: string;
  apellido: string;
  direccion: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  estado_cliente: string;
  usuario_registro: string;
}

export interface UpdatePrestatarioDto {
  nombre?: string;
  apellido?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  estado_cliente?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error?: string;
}

interface CedulaValidationResponse {
  duplicada: boolean;
}

interface BulkLoadPayload {
  content: string;
  nombre_archivo?: string;
  usuario?: string;
}

interface BulkLoadResult {
  total: number;
  aceptados: number;
  rechazados: number;
  detalles: {
    linea: number;
    motivo: string;
  }[];
  id_log_pk: number;
}

/**
 * GET /api/prestatarios
 * Descripción: Lista todos los prestatarios (solo empleados).
 * Respuesta esperada:
 * - ok: true
 * - result: Array de registros de prestatarios.
 */
export async function getPrestatarios(): Promise<Prestatario[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/prestatarios');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al cargar prestatarios');
  }
  return mapPrestatariosFromApi(response.data.result);
}

/**
 * GET /api/prestatarios/:ci
 * Descripción: Obtiene un prestatario por cédula (empleado o propietario).
 * Parámetros:
 * - ci: número de cédula.
 * Respuesta esperada:
 * - ok: true
 * - result: datos del prestatario.
 */
export async function getPrestatarioByCi(ci: number | string): Promise<Prestatario> {
  const response = await httpClient.get<ApiResponse<any>>(`/api/prestatarios/${ci}`);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener prestatario');
  }
  return mapPrestatarioFromApi(response.data.result);
}

/**
 * POST /api/prestatarios
 * Descripción: Registra un nuevo prestatario (público).
 * Cuerpo esperado:
 * - ci, nombre, apellido, direccion, email, telefono, fecha_nacimiento (YYYY-MM-DD),
 *   estado_cliente, usuario_registro.
 * Respuesta esperada:
 * - ok: true
 * - result: { inserted: true }
 */
export async function createPrestatario(payload: CreatePrestatarioDto): Promise<void> {
  const response = await httpClient.post<ApiResponse<{ inserted: boolean }>>('/api/prestatarios', payload);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al crear prestatario');
  }
}

/**
 * PUT /api/prestatarios/:ci
 * Descripción: Modifica un prestatario existente (empleado o propietario).
 * Parámetros:
 * - ci: número de cédula.
 * Cuerpo esperado: campos a actualizar.
 * Respuesta esperada:
 * - ok: true
 * - result: { updated: true }
 */
export async function updatePrestatario(ci: number | string, payload: UpdatePrestatarioDto): Promise<void> {
  const response = await httpClient.put<ApiResponse<{ updated: boolean }>>(`/api/prestatarios/${ci}`, payload);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al actualizar prestatario');
  }
}

/**
 * DELETE /api/prestatarios/:ci
 * Descripción: Elimina un prestatario por cédula (solo empleados).
 * Respuesta esperada:
 * - ok: true
 * - result: { deleted: true }
 */
export async function deletePrestatario(ci: number | string): Promise<void> {
  const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/api/prestatarios/${ci}`);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al eliminar prestatario');
  }
}

/**
 * GET /api/prestatarios/validar/:ci
 * Descripción: Valida duplicidad de cédula.
 * Respuesta esperada:
 * - duplicada: boolean
 */
export async function validarCedula(ci: number | string): Promise<boolean> {
  const response = await httpClient.get<CedulaValidationResponse>(`/api/prestatarios/validar/${ci}`);
  return response.data.duplicada;
}

/**
 * POST /api/prestatarios/carga
 * Descripción: Carga masiva de prestatarios desde contenido CSV/TXT.
 * Cuerpo esperado:
 * - content: string (contenido del archivo)
 * - nombre_archivo?: string
 * - usuario?: string
 * Respuesta esperada:
 * - ok: true
 * - result: resumen de carga con totales y detalles.
 */
export async function cargaMasivaPrestatarios(payload: BulkLoadPayload): Promise<BulkLoadResult> {
  const response = await httpClient.post<ApiResponse<BulkLoadResult>>('/api/prestatarios/carga', payload);
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error en carga masiva');
  }
  return response.data.result;
}

/**
 * GET /api/prestatarios/obtener-logs-carga
 * Descripción: Obtiene los logs históricos de cargas masivas de clientes.
 * Respuesta esperada:
 * - ok: true
 * - result: arreglo de logs de carga con sus detalles.
 */
export async function obtenerLogsCargaPrestatarios(): Promise<LoadLog[]> {
  const response = await httpClient.get<ApiResponse<LoadLog[]>>('/api/prestatarios/obtener-logs-carga');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener logs de carga');
  }
  return mapPrestatariosLoadLogsFromApi(response.data.result);
}
