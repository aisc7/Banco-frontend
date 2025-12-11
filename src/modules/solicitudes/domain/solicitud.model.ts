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
}

export function mapSolicitudFromApi(raw: any): Solicitud {
  return {
    id: raw.ID_SOLICITUD_PRESTAMO ?? raw.id_solicitud_prestamo,
    idPrestatario: raw.ID_PRESTATARIO ?? raw.id_prestatario,
    idEmpleado: raw.ID_EMPLEADO ?? raw.id_empleado ?? null,
    monto: raw.MONTO ?? raw.monto,
    nroCuotas: raw.NRO_CUOTAS ?? raw.nro_cuotas,
    fechaEnvio: raw.FECHA_ENVIO ?? raw.fecha_envio,
    fechaRespuesta: raw.FECHA_RESPUESTA ?? raw.fecha_respuesta ?? null,
    estado: (raw.ESTADO ?? raw.estado) as SolicitudEstado,
    motivoRechazo: raw.MOTIVO ?? raw.motivo ?? null
  };
}

export function mapSolicitudesFromApi(rawList: any[] | null | undefined): Solicitud[] {
  return (rawList || []).map(mapSolicitudFromApi);
}

