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

export interface BulkLoadResult {
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
 * POST /api/prestatarios/:ci/foto
 * Descripción: Sube o actualiza la foto de un prestatario usando multipart/form-data.
 * Cuerpo esperado:
 * - foto: archivo (campo multipart)
 * Respuesta esperada:
 * - ok: true
 * - result: { updated: true }
 */
export async function subirFotoPrestatario(ci: number | string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('foto', file);

  const response = await httpClient.post<ApiResponse<{ updated: boolean }>>(
    `/api/prestatarios/${ci}/foto`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al subir la foto del prestatario');
  }
}

/**
 * POST /api/prestatarios/carga-masiva
 * Descripción: Carga masiva de prestatarios desde archivo CSV/TXT.
 * Cuerpo esperado:
 * - multipart/form-data con campo `archivo`.
 * Respuesta esperada:
 * - ok: true
 * - result: resumen de carga con totales y detalles.
 */
export async function cargaMasivaPrestatarios(file: File): Promise<BulkLoadResult> {
  const formData = new FormData();
  formData.append('archivo', file);

  const response = await httpClient.post<ApiResponse<BulkLoadResult>>(
    '/api/prestatarios/carga-masiva',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
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
export async function obtenerLogsCargaPrestatarios(): Promise<PrestatariosLoadLog[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/prestatarios/obtener-logs-carga');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al obtener logs de carga');
  }
  return mapPrestatariosLoadLogsFromApi(response.data.result);
}

// Alias de conveniencia siguiendo la convención del enunciado
export const listarPrestatarios = getPrestatarios;
export const obtenerPrestatarioPorCI = getPrestatarioByCi;
export const crearPrestatario = createPrestatario;
export const actualizarPrestatario = updatePrestatario;
export const eliminarPrestatario = deletePrestatario;

/**
 * GET /api/prestatarios/me
 * Descripción: Obtiene el perfil del prestatario autenticado, usando id_prestatario del token.
 * Seguridad: requiere rol PRESTATARIO.
 */
export async function getPrestatarioMe(): Promise<Prestatario> {
  const response = await httpClient.get<ApiResponse<any>>('/api/prestatarios/me');
  if (!response.data.ok) {
    throw new Error(response.data.error || 'Error al cargar el perfil del prestatario');
  }
  return mapPrestatarioFromApi(response.data.result);
}
