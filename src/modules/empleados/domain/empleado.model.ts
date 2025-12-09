// Modelo de dominio de Empleado para el frontend y funciones de mapeo desde la API.
export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  cargo?: string | null;
  salario?: number | null;
  edad?: number | null;
}

export function mapEmpleadoFromApi(raw: any): Empleado {
  return {
    id: raw.ID_EMPLEADO ?? raw.id_empleado,
    nombre: raw.NOMBRE ?? raw.nombre,
    apellido: raw.APELLIDO ?? raw.apellido,
    cargo: raw.CARGO ?? raw.cargo ?? null,
    salario: raw.SALARIO ?? raw.salario ?? null,
    edad: raw.EDAD ?? raw.edad ?? null
  };
}

export function mapEmpleadosFromApi(rawList: any[] | null | undefined): Empleado[] {
  return (rawList || []).map(mapEmpleadoFromApi);
}

