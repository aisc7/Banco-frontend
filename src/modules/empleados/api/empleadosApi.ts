import { httpClient } from '../../../shared/api/httpClient';
import {
  Empleado,
  mapEmpleadoFromApi,
  mapEmpleadosFromApi
} from '../domain/empleado.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface CreateEmpleadoDto {
  nombre: string;
  apellido: string;
  cargo?: string;
  salario?: number;
  edad?: number;
}

export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>;

/**
 * GET /api/empleados
 * Descripción: Lista todos los empleados.
 */
export async function getEmpleados(): Promise<Empleado[]> {
  const response = await httpClient.get<ApiResponse<any[]>>('/api/empleados');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener empleados');
  }
  return mapEmpleadosFromApi(response.data.data);
}

/**
 * GET /api/empleados/:id
 * Descripción: Obtiene un empleado por ID.
 */
export async function getEmpleado(id: number): Promise<Empleado> {
  const response = await httpClient.get<ApiResponse<any>>(`/api/empleados/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener empleado');
  }
  return mapEmpleadoFromApi(response.data.data);
}

/**
 * POST /api/empleados
 * Descripción: Crea un nuevo empleado.
 */
export async function createEmpleado(payload: CreateEmpleadoDto): Promise<Empleado> {
  const response = await httpClient.post<ApiResponse<any>>('/api/empleados', payload);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al crear empleado');
  }
  return mapEmpleadoFromApi(response.data.data);
}

/**
 * PUT /api/empleados/:id
 * Descripción: Actualiza un empleado existente.
 */
export async function updateEmpleado(id: number, payload: UpdateEmpleadoDto): Promise<Empleado> {
  const response = await httpClient.put<ApiResponse<any>>(`/api/empleados/${id}`, payload);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al actualizar empleado');
  }
  return mapEmpleadoFromApi(response.data.data);
}

/**
 * DELETE /api/empleados/:id
 * Descripción: Elimina un empleado por ID.
 */
export async function deleteEmpleado(id: number): Promise<void> {
  const response = await httpClient.delete<ApiResponse<any>>(`/api/empleados/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al eliminar empleado');
  }
}
