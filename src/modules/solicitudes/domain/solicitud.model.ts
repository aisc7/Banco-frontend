// Modelo de dominio de Solicitud de Préstamo para el frontend y funciones de mapeo desde la API.

export type SolicitudEstado = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

export interface Solicitud {
  id: number;
  idPrestatario: number;
  idEmpleado: number | null;
  monto: number;
  nroCuotas: number;
  fechaEnvio: string;
  fechaRespuesta: string | null;
  estado: SolicitudEstado;
  motivoRechazo?: string | null;
  prest_nombre?: string;
  prest_apellido?: string;
  prest_ci?: number | string;
  nombrePrestatario?: string;
}

export function mapSolicitudFromApi(raw: any): Solicitud {
  const prest_nombre = raw.prest_nombre ?? raw.PREST_NOMBRE;
  const prest_apellido = raw.prest_apellido ?? raw.PREST_APELLIDO;
  const prest_ci = raw.prest_ci ?? raw.PREST_CI;
  const nombrePrestatario = (prest_nombre || prest_apellido)
    ? `${prest_nombre ?? ''} ${prest_apellido ?? ''}`.trim()
    : raw.id_prestatario ?? raw.idPrestatario ?? '';
  return {
    id: raw.ID_SOLICITUD_PRESTAMO ?? raw.id_solicitud_prestamo,
    idPrestatario: raw.ID_PRESTATARIO ?? raw.id_prestatario,
    idEmpleado: raw.ID_EMPLEADO ?? raw.id_empleado ?? null,
    monto: raw.MONTO ?? raw.monto,
    nroCuotas: raw.NRO_CUOTAS ?? raw.nro_cuotas,
    fechaEnvio: raw.FECHA_ENVIO ?? raw.fecha_envio,
    fechaRespuesta: raw.FECHA_RESPUESTA ?? raw.fecha_respuesta ?? null,
    estado: (raw.ESTADO ?? raw.estado) as SolicitudEstado,
    motivoRechazo: raw.MOTIVO ?? raw.motivo ?? null,
    prest_nombre,
    prest_apellido,
    prest_ci,
    nombrePrestatario,
  };
}

export function mapSolicitudesFromApi(rawList: any[] | null | undefined): Solicitud[] {
  return (rawList || []).map(mapSolicitudFromApi);
}

