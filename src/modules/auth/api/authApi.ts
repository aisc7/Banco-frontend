import { httpClient } from '../../../shared/api/httpClient';
import type { CreatePrestatarioDto } from '../../prestatarios/api/prestatariosApi';
import type { CreateEmpleadoDto } from '../../empleados/api/empleadosApi';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
}

export interface LoginResponse {
  success: boolean;
  data: LoginResponseData | null;
  message: string | null;
}

/**
 * POST /api/auth/login
 * Descripción: Autentica a un usuario (empleado o prestatario) y devuelve un JWT.
 * Cuerpo esperado:
 * - username: string
 * - password: string
 * Respuesta esperada:
 * - success: boolean
 * - data: { token: string } | null
 * - message: string
 */
export async function login(payload: LoginPayload): Promise<LoginResponseData> {
  const response = await httpClient.post<LoginResponse>('/api/auth/login', payload);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Error de autenticación');
  }
  return response.data.data;
}

interface RegisterApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export interface RegisterPrestatarioPayload {
  username: string;
  password: string;
  prestatario: CreatePrestatarioDto;
}

export interface RegisterEmpleadoPayload {
  username: string;
  password: string;
  empleado: CreateEmpleadoDto;
}

interface RegisteredUserInfo {
  username: string;
  role: string;
  id_prestatario?: number;
  id_empleado?: number;
}

interface RegisterPrestatarioResponseData {
  user: RegisteredUserInfo;
  prestatario: unknown;
}

interface RegisterEmpleadoResponseData {
  user: RegisteredUserInfo;
  empleado: unknown;
}

/**
 * POST /api/auth/register-prestatario
 * Descripción: Crea un prestatario y su usuario asociado (rol PRESTATARIO).
 */
export async function registerPrestatario(payload: RegisterPrestatarioPayload): Promise<RegisterPrestatarioResponseData> {
  const response = await httpClient.post<RegisterApiResponse<RegisterPrestatarioResponseData>>(
    '/api/auth/register-prestatario',
    payload
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Error al registrar prestatario');
  }
  return response.data.data;
}

/**
 * POST /api/auth/register-empleado
 * Descripción: Crea un empleado y su usuario asociado (rol EMPLEADO).
 */
export async function registerEmpleado(payload: RegisterEmpleadoPayload): Promise<RegisterEmpleadoResponseData> {
  const response = await httpClient.post<RegisterApiResponse<RegisterEmpleadoResponseData>>(
    '/api/auth/register-empleado',
    payload
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Error al registrar empleado');
  }
  return response.data.data;
}

