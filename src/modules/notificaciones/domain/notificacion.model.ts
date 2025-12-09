// Modelo de dominio de Notificacion para el frontend y funciones de mapeo desde la API.
export interface Notificacion {
  idNotificacion: number;
  idPrestatario: number | null;
  idCuota: number | null;
  tipo: string;
  mensaje: string;
  enviado?: string;
}

export function mapNotificacionFromApi(raw: any): Notificacion {
  return {
    idNotificacion: raw.ID_NOTIFICACION ?? raw.id_notificacion,
    idPrestatario: raw.ID_PRESTATARIO ?? raw.id_prestatario ?? null,
    idCuota: raw.ID_CUOTA ?? raw.id_cuota ?? null,
    tipo: raw.TIPO ?? raw.tipo,
    mensaje: raw.MENSAJE ?? raw.mensaje,
    enviado: raw.ENVIADO ?? raw.enviado
  };
}

export function mapNotificacionesFromApi(rawList: any[] | null | undefined): Notificacion[] {
  return (rawList || []).map(mapNotificacionFromApi);
}

